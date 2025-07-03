---
layout: post
title: "Java Root Certificate Pinning For Microsoft OAuth"
date: 2025-07-02 12:00:00 -0400
categories: [java, microsoft]
tags: [java, root, certificate, technical]
hidden: false
---

**TL;DR**: We recently began seeing intermittent SSLHandshakeException errors when calling Microsoft login endpoints from our Java service. The root cause turned out to be missing root certificates in the Temurin Java images — even in recent versions. Microsoft had rotated their TLS chain, and the new root wasn’t bundled. We built a tool to dynamically extract the cert chain and patch the JVM truststore during our Docker build.

Here’s how we fixed it.

---

### 💼 Background: LEAD’s Microsoft Integration

At [LEAD](https://www.lead.app), we integrate deeply with the Microsoft product suite — including Teams and Outlook Calendar.

Users can link their Google or Outlook calendars to LEAD via delegated permissions, enabling us to:

- Automatically schedule meetings between matched peers in mutually available slots
- Provide calendar-driven insights for organizations — including network analysis, meeting load metrics, organization health metrics, and more

This requires secure and reliable programmatic access to Microsoft’s OAuth endpoints (e.g., login.microsoftonline.com). When that connection fails, so does a critical part of our platform.


### The Problem

We began receiving intermittent alerts from Rollbar, our error tracking tool, showing the following error:
```
SSLHandshakeException: PKIX path building failed:
  sun.security.provider.certpath.SunCertPathBuilderException:
    unable to find valid certification path to requested target
```
The failures were inconsistent — which made diagnosis trickier — but they all pointed to Microsoft login endpoints (e.g., login.microsoftonline.com), giving us a clear place to start investigating.


### Our Setup

A quick note on the context — this issue affected our backend service, which:

- Runs on a Temurin Java 17 base image
- Is deployed as a Docker container on Azure App Service, with live and inactive deployment slots
- Uses Azure for logs and metrics, and Rollbar for proactive alerting

These details will become relevant as we walk through the debugging process.


### Step 1: 🔍 Diagnosis

We started by checking some obvious things:

- Used Azure’s Kudu console to confirm that we could reach the Microsoft login endpoints from within our container
- Verified we were using the default Java truststore: `System.out.println("javax.net.ssl.trustStore: " + System.getProperty("javax.net.ssl.trustStore"));`
- Confirmed we were running a supported Java version that was being regularly updated
- Reproduced the issue on newer Temurin images (Java 21 LTS and 24)

After ruling out basic misconfigurations, we began to suspect the root cause was related to missing or outdated certificates in the JVM truststore. We found similar issues reported in [Adoptium's GitHub](https://github.com/adoptium/temurin-build/issues/2783), as noted in their [security docs](https://github.com/adoptium/temurin-build/blob/0829acbf6e6118b8afe50e5a554e2c144cfa7999/security/README.md).

To better understand the intermittent cert failures (possibly due to load balancers serving different chains), we ran the following script (note that Java was used to best mirror the environment in which the error occurred):
```java
import javax.net.ssl.*;
import java.net.InetAddress;
import java.net.URL;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.*;

public class SSLCertCheck {
    private static String formatCert(X509Certificate cert) {
        return "Subject: " + cert.getSubjectX500Principal().getName("RFC2253") + "\n" +
               "Issuer: " + cert.getIssuerX500Principal().getName("RFC2253") + "\n" +
               "Valid until: " + cert.getNotAfter();
    }

    public static void main(String[] args) throws Exception {
        String httpsURL = "https://login.microsoftonline.com";
        int runs = 50;

        Map<String, Integer> chainCounts = new LinkedHashMap<>();

        for (int i = 0; i < runs; i++) {
            try {
                URL url = new URL(httpsURL);
                HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
                connection.setSSLSocketFactory(SSLContext.getDefault().getSocketFactory());
                connection.connect();

                InetAddress address = InetAddress.getByName(url.getHost());
                String ip = address.getHostAddress();

                Certificate[] certs = connection.getServerCertificates();
                List<String> chainLines = new ArrayList<>();
                for (Certificate cert : certs) {
                    X509Certificate x509 = (X509Certificate) cert;
                    chainLines.add(formatCert(x509));
                }
                String chainFingerprint = String.join("\n---\n", chainLines);

                chainCounts.put(chainFingerprint, chainCounts.getOrDefault(chainFingerprint, 0) + 1);

                System.out.println("[" + (i + 1) + "] Connected to: " + url.getHost() + " (" + ip + ")");
                System.out.println("Protocol: " + connection.getCipherSuite());
                System.out.println(chainFingerprint);
                System.out.println();

                connection.disconnect();
                Thread.sleep(500);
            } catch (Exception e) {
                System.err.println("Error on iteration " + (i + 1) + ": " + e.getMessage());
            }
        }

        System.out.println("=== Certificate Chain Summary ===");
        for (Map.Entry<String, Integer> entry : chainCounts.entrySet()) {
            System.out.println("\n--- Chain seen " + entry.getValue() + " times ---");
            System.out.println(entry.getKey());
        }
    }
}
```
We ran this utility inside the container:
```
$ docker run -it --entrypoint /bin/bash lead-app-local
$ javac SSLCertCheck.java
```

Which yielded the following output:
```
$ java SSLCertCheck.java

...

=== Certificate Chain Summary ===

--- Chain seen 28 times ---
Subject: CN=stamp2.login.microsoftonline.com,O=Microsoft Corporation,L=Redmond,ST=Washington,C=US
Issuer: CN=DigiCert SHA2 Secure Server CA,O=DigiCert Inc,C=US
Valid until: Wed Nov 26 23:59:59 UTC 2025
---
Subject: CN=DigiCert SHA2 Secure Server CA,O=DigiCert Inc,C=US
Issuer: CN=DigiCert Global Root CA,OU=www.digicert.com,O=DigiCert Inc,C=US
Valid until: Sun Sep 22 23:59:59 UTC 2030

--- Chain seen 22 times ---
Subject: CN=stamp2.login.microsoftonline.com,O=Microsoft Corporation,L=Redmond,ST=WA,C=US
Issuer: CN=Microsoft Azure RSA TLS Issuing CA 04,O=Microsoft Corporation,C=US
Valid until: Sat Nov 22 15:08:04 UTC 2025
---
Subject: CN=Microsoft Azure RSA TLS Issuing CA 04,O=Microsoft Corporation,C=US
Issuer: CN=DigiCert Global Root G2,OU=www.digicert.com,O=DigiCert Inc,C=US
Valid until: Tue Aug 25 23:59:59 UTC 2026
```
Out of 50 requests, the responses were roughly evenly split between the two certificate chains. This explained the intermittent nature of the failures — especially since we were retrying failed requests up to 3 times. Assuming a ~50% failure rate per attempt, the probability of all retries failing was still a non-negligible 12.5%.


### Step 2: 🔨 The Fix - Extracting the Cert Chain

After confirming that we were indeed using the default Java Truststore, we opted not to replace it entirely. Instead, we built a tool to dynamically extract the full certificate chain and patch the truststore during our Docker build.

While the intermediate certificates may not strictly be required, we included them for completeness and future-proofing.

```bash
#!/bin/bash
set -euo pipefail

# THIS SCRIPT, GIVEN A PATH, WILL FOLLOW IT AND DOWNLOAD ALL ROOT AND INTERMEDIATE CERTS
# IT WILL RUN 20x SINCE COMPANIERS MAY USE A LOAD BALANCER AND SERVE DIFFERENT CERTS

mkdir -p certs_collected
echo "🔍 Fetching cert chain from https://login.microsoftonline.com..."

for i in $(seq 1 20); do
  echo "🔁 Attempt $i of 20..."

  openssl s_client -connect login.microsoftonline.com:443 -showcerts </dev/null 2>/dev/null \
  | awk '
      /-----BEGIN CERTIFICATE-----/ {c++; out = "certs_collected/tmp_cert_" c ".pem"}
      out { print > out }
      /-----END CERTIFICATE-----/ { out = "" }
  '

  for file in certs_collected/tmp_cert_*.pem; do
    [ -f "$file" ] || continue
    sha=$(openssl x509 -in "$file" -noout -fingerprint -sha256 2>/dev/null | cut -d'=' -f2 | tr -d ':')
    if [ -z "$sha" ]; then
      echo "  ⚠️ Skipping unreadable cert: $file"
      rm -f "$file"
      continue
    fi
    dest="certs_collected/${sha}.pem"
    if [ ! -f "$dest" ]; then
      mv "$file" "$dest"
      echo "  📥 Saved new cert: $dest"
    else
      rm "$file"
    fi
  done
done
```
This script ran 20 times, collecting and deduplicating certificates on each run by hashing their contents.
```
$ chmod 775 cerficate_fetch.sh
$  ./certfetch.sh

🔍 Fetching cert chain from https://login.microsoftonline.com...
🔁 Attempt 1 of 20...
  📥 Saved new cert: certs_collected/7363ED276A96A66D6D303FA82D1370A4847DE1AE33DAE05958E292A277E907A7.pem
  📥 Saved new cert: certs_collected/33F9731BE910A66DC6ACD07D9D9CA212EE8D0A9A5C78C8BF3E89BB74DF8FB936.pem
🔁 Attempt 2 of 20...
  📥 Saved new cert: certs_collected/5289526AC0E6C8BE614E9C2FFE80D83F831EB6ED0B24BA93460D4A54A6FC1E06.pem
  📥 Saved new cert: certs_collected/C1AD7778796D20BCA65C889A2655021156528BB62FF5FA43E1B8E5A83E3D2EAA.pem
🔁 Attempt 3 of 20...
🔁 Attempt 4 of 20...
🔁 Attempt 5 of 20...
🔁 Attempt 6 of 20...
🔁 Attempt 7 of 20...
🔁 Attempt 8 of 20...
🔁 Attempt 9 of 20...
🔁 Attempt 10 of 20...
🔁 Attempt 11 of 20...
🔁 Attempt 12 of 20...
🔁 Attempt 13 of 20...
🔁 Attempt 14 of 20...
🔁 Attempt 15 of 20...
🔁 Attempt 16 of 20...
🔁 Attempt 17 of 20...
🔁 Attempt 18 of 20...
🔁 Attempt 19 of 20...
🔁 Attempt 20 of 20...
```

In the end, the following 4 certificates were saved to our output directory:
```
$ ls -1 /tmp/certs_collected

33F9731BE910A66DC6ACD07D9D9CA212EE8D0A9A5C78C8BF3E89BB74DF8FB936.pem
5289526AC0E6C8BE614E9C2FFE80D83F831EB6ED0B24BA93460D4A54A6FC1E06.pem
7363ED276A96A66D6D303FA82D1370A4847DE1AE33DAE05958E292A277E907A7.pem
C1AD7778796D20BCA65C889A2655021156528BB62FF5FA43E1B8E5A83E3D2EAA.pem
```

### Step 3: 🔨 The Fix - Patching the Truststore

We created a new directory `src/main/resources/certificates` and placed the 4 extracted certificates there.

Then, we updated our Dockerfile to import these certificates into the JVM truststore during the build process:
```dockerfile
FROM eclipse-temurin:17-jdk

# Certs required for Microsoft
COPY src/main/resources/certs/*.pem /tmp/certs/

# Import the cert into the default JVM truststore
RUN for cert in /tmp/certs/*.pem; do \
      alias=$(sha256sum "$cert" | cut -c1-12)-$(basename "$cert" .pem | sed 's/[^a-zA-Z0-9._-]//g'); \
      echo "Importing $alias"; \
      keytool -importcert \
        -noprompt \
        -trustcacerts \
        -alias "$alias" \
        -file "$cert" \
        -cacerts \
        -storepass changeit; \
    done

WORKDIR /app

COPY build/libs/app.jar /app/app.jar
COPY clear-expired-certs.sh /app/
COPY start.sh /app/
RUN chmod +x /app/start.sh
RUN chmod +x /app/clear-expired-certs.sh
RUN java -version

EXPOSE 5000
ENTRYPOINT ["sh", "/app/start.sh"]
```

And for good measure, we added a script to remove any expired certificates from the truststore during the Docker build:
```bash
#!/bin/bash
set -euo pipefail

KEYSTORE="$JAVA_HOME/lib/security/cacerts"
STOREPASS="changeit"

echo "🔍 Scanning keystore for expired certificates as of $(date -u)..."

keytool -list -v -keystore "$KEYSTORE" -storepass "$STOREPASS" 2>/dev/null \
| awk -v now="$(date -u +%s)" '
  /^Alias name:/ { sub(/^Alias name: /, "", $0); alias=$0 }
  /Valid from:/ {
    split($0, parts, "until: ");
    if (length(parts) > 1) {
      gsub(/UTC/, "", parts[2]);
      cmd = "date -u -d \"" parts[2] "\" +%s"
      cmd | getline expiry
      close(cmd)
      if (expiry < now) {
        print alias
      }
    }
  }' | while read -r expired_alias; do
    echo "🧹 Deleting expired certificate: $expired_alias"
    keytool -delete -alias "$expired_alias" -storepass "$STOREPASS" -cacerts || \
      echo "⚠️  Warning: alias not found: $expired_alias"
done
```

This confirmed that the script was working as expected and identified at least one outdated certificate included in the base image:
```
2025-07-01T04:03:47.9977412Z 🔍 Cleaning up expired Java certs...
2025-07-01T04:03:48.0342238Z 🔍 Scanning keystore for expired certificates as of Tue Jul  1 04:03:48 AM UTC 2025...
2025-07-01T04:03:52.1901323Z 🧹 Deleting expired certificate: cn_baltimore_cybertrust_root,ou_cybertrust,o_baltimore,c_ie [jdk]
```

### ✅ Result

After applying the fix, the handshake errors disappeared — and we now have a reusable, auditable solution in place for future integrations.

- ✅ No more `SSLHandshakeException` errors
- ✅ Works consistently across CI, local development, and Azure Web App deployments
- ✅ Cert chain is explicitly managed, versioned, and auditable

### 🧠 Takeaways

- Temurin’s bundled truststore can lag behind active certificate authority (CA) changes
- Java apps in containers rely on the bundled truststore — not the host system’s root CAs
- Multi-path certificate chains mean some roots may only appear intermittently
- Dynamically fetching and patching the cert chain gave us a clear, reliable fix — and a reusable pattern for other integrations
- Even though a newer image didn’t resolve this issue, keeping base images current is still good practice

