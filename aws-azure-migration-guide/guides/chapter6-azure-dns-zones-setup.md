---
layout: default
title: "Migrating DNS from AWS Route 53 to Azure DNS Zones"
description: "Move DNS management from Amazon Route 53 to Azure DNS Zones, with guidance on name server delegation, record import, and alias A records."
permalink: /aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/
last_modified_at: 2026-11-27
image:
  path: /assets/images/dns-domains-configuration.jpg
  alt: "Updating registrar name servers to delegate DNS to Azure DNS Zones"
---

<nav class="guide-breadcrumb" aria-label="Breadcrumb">
  <a href="/aws-azure-migration-guide/">AWS to Azure Migration Guide</a>
  <span class="crumb-sep" aria-hidden="true">/</span>
  <span>Chapter 6 of 6</span>
</nav>

# Migrating DNS from AWS Route 53 to Azure DNS Zones

<div class="chapter-meta-line">
  <span class="chapter-number">Chapter 6</span>
  <span class="reading-time-wrapper">{% include reading_time.html %}</span>
  <span class="category">Network &amp; DNS</span>
  <span class="migration-path"><strong>Route 53</strong> → <strong>Azure DNS Zones</strong></span>
</div>

<div class="chapter-intro">
  <p>Chapter 6 of 6 in our series on migrating LEAD's enterprise platform from AWS to Azure — covering how we delegated DNS from AWS Route 53 and external registrars to Azure DNS Zones.</p>
</div>


## Step 1: Purchase or Keep Your Domain with a Registrar

Because Azure doesn’t function as a registrar, your domain must live with a third-party registrar.

For new domains, purchase from a registrar (e.g., Namecheap, Route53, GoDaddy, etc). For existing domains, they can stay with their current registrar.

The only requirement is:

> You must control the domain and be able to modify its name servers.


## Step 2: Create an Azure DNS Zone

Inside Microsoft Azure:

1. Create a new **DNS Zone**
2. Name it exactly your domain (e.g., `example.com`)
3. Deploy it to your resource group

![Create DNS Zone]({{ "/assets/images/create-dns-zone-1.png" | relative_url }}){: .width-constrained-500 }

Note that existing DNS records can be bulk imported from an export with your current registrar (which vastly reduces the potential for human error):

![Create DNS Zone]({{ "/assets/images/create-dns-zone-2.png" | relative_url }}){: .width-constrained-500 }

In this case, we'll skip this as we're using a brand new domain and will add additional routes progressively.

Once created, Azure will assign a set of **Name Server (NS) records** to that DNS Zone.

These look something like:

```
ns1-xx.azure-dns.com
ns2-xx.azure-dns.net
ns3-xx.azure-dns.org
ns4-xx.azure-dns.info
```

These are critical for the next step.


## Step 3: Point Your Domain to Azure

Now go back to your registrar (e.g., Namecheap, GoDaddy, etc).

Replace the existing name servers with the Azure-provided NS records.

![Update Name Servers]({{ "/assets/images/dns-domains-configuration.jpg" | relative_url }})

This effectively tells the internet:

> “Azure is now the authoritative DNS provider for this domain.”

DNS propagation may take anywhere from minutes to 24–48 hours depending on TTL and registrar behavior.

Once propagation completes, Azure DNS becomes your source of truth.


## What Azure DNS Actually Gives You

After delegation:

* You manage **A, AAAA, CNAME, TXT, MX, and other records directly inside Azure**
* Azure services can automatically validate and attach custom domains
* You can manage DNS records alongside your Azure infrastructure
* Infrastructure-as-code becomes easier (Bicep/Terraform)

Azure DNS does not host your site — it only resolves domain names to services.

## How This Fits Into the Migration

Each of the service migrations covered in earlier chapters — [Azure App Service](/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/), [WordPress](/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/), and [Static Web Apps / Front Door](/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/) — eventually comes down to custom domain validation and routing:

* Adding a TXT record for domain ownership verification
* Adding an alias A record (for apex domains) or CNAME record for traffic routing
* Keeping email records (MX, SPF, DKIM, DMARC) intact during cutover

Because your domain is delegated to Azure DNS, those records can be managed centrally alongside the rest of your Azure environment — and you no longer need the apex redirect workarounds required when DNS lived in Route 53.

## AWS vs Azure DNS at a Glance

| Capability                | Route 53 (AWS) | Azure DNS |
| ------------------------- | -------------- | --------- |
| Domain registration       | Yes            | No        |
| DNS hosting               | Yes            | Yes       |
| Deep platform integration | Yes            | Yes       |
| Managed in cloud console  | Yes            | Yes       |

## Final Takeaway

DNS migration is straightforward (but high risk, so it needs to be executed carefully):

1. Keep your domain at a registrar
2. Create an Azure DNS Zone and import existing records
3. Delegate your domain's name servers to Azure
4. Manage all records — including apex aliases to Azure services — inside Azure going forward

With DNS delegated to Azure alongside your applications, databases, and static sites, the final AWS dependency is retired and your entire production footprint runs natively on Azure.

<div class="chapter-subscribe">
  <h3>Enjoyed this guide?</h3>
  <p>Occasional essays on engineering, AI, and building products — no spam, unsubscribe anytime</p>
  <form
    action="https://buttondown.com/api/emails/embed-subscribe/jasonwillems"
    method="post"
    class="subscribe-form"
  >
    <input type="hidden" name="metadata__source" value="{{ page.url }}" />
    <div class="form-row">
      <input type="email" name="email" aria-label="Email address" autocomplete="email" placeholder="your@email.com" required />
      <button type="submit">Subscribe</button>
    </div>
  </form>
</div>

<nav class="next-chapter-section two-col" aria-label="Chapter navigation">
  <a href="/aws-azure-migration-guide/guides/chapter5-azure-db-migration/" class="chapter-pager-link prev">
    <span class="pager-kicker">← Previous Chapter</span>
    <span class="pager-title">PostgreSQL Migration from RDS to Azure</span>
  </a>
  <a href="/aws-azure-migration-guide/" class="chapter-pager-link next">
    <span class="pager-kicker">Back to Guide →</span>
    <span class="pager-title">All Chapters &amp; Service Matrix</span>
  </a>
</nav>
