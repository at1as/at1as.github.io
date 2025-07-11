---
layout: post
title: "IOT Fails: Staging Is For Customer Data, Apparently"
date: 2025-07-10 12:00:00 -0400
categories: [staging, security]
tags: [staging, security, technical]
hidden: false
---

As smart pet devices become more common, many of us have come to depend on them without a second thought. Unfortunately, that reliance may be premature, as we’re beginning to understand their limitations over time.

The trust we place in these devices can evaporate quickly when the software behind them quietly breaks—and the company behind it says nothing.

On **July 9, 2025**, I was abruptly signed out of my [**Petlibro Granary Smart Camera Cat Feeder**](https://petlibro.com/collections/granary) iOS app.

When I attempted to log back in, I was met with this error:
```
code: 1101
msg: MEMBER_NOT_EXIST
```

This was bizarre—not only were my credentials correct (managed by a password manager), but the app was suddenly showing **a lot of internal information**:

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/member-not-exist-debug.jpg" alt="Petlibro Sign in Error" class="small-img">
  <figcaption>Debug Trace on by default</figcaption>
</figure>

While the failed login was frustrating, the more concerning issue was that the app appeared to have **unlocked internal developer tools**, complete with:

- Debug overlays in Chinese
- A request inspector showing live API payloads
- A terminal interface
- And traffic pointed at what appears (at best guess) to be a **staging environment**

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/sign-in-page.jpg" alt="Sign In Page" class="small-img">
  <figcaption>Sign-in page with unusual debug context</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/ume-console.PNG" alt="Ume Console" class="small-img">
  <figcaption>Ume Developer Tools Console</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/align-ruler.PNG" alt="Align Ruler Dev Tools" class="small-img">
  <figcaption>Align Ruler Developer Tool</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/request-inspector.PNG" alt="Request Inspector" class="small-img">
  <figcaption>Request Inspecto showing API Routes</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/terminal-mini.PNG" alt="Terminal" class="small-img">
  <figcaption>Embedded Terminal</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/2025-07-10-Staging-Is-For-Customer-Data/full-screen-terminal.PNG" alt="Terminal" class="small-img">
  <figcaption>Full Screen Terminal</figcaption>
</figure>


### What Might Have Happened?

For the record, I haven’t tampered with the app or sideloaded anything. This was the **official iOS production build (v1.6.20)** from the App Store. While I do have a background in software, I wasn’t inspecting bundles or reverse-engineering anything — all of this was **visibly exposed in the UI** during the login screen.

#### What We Know

- The presence of a `Dio Request Inspector` suggests the app is built with **Flutter (Dart)**.
- The app was performing **extensive client-side logging**, including authentication requests and routing, with location information.
- Debug text and UI overlays were in **Chinese**, indicating that development may be at least partially based in China.

#### What We Suspect

- *It seems to me* that Petlibro **accidentally pointed the production app to a staging API**, possibly during a test deployment, which temporarily enabled internal developer tools and routed requests to a non-production backend.
- *I would guess* this was an internal configuration error — not malicious tampering — but as an external user, I have **no visibility** into whether any **user data was exposed**, mishandled, or at risk.
- The domain in question (`test-api.dl-aiot.com`) appears to be a **test/staging subdomain**, but for all I know, it could have been **someone else’s server entirely** (the whois data is redacted), raising concerns about unintentional data leakage or unintended access to other users' information.
- Critically, **there was no invalidation of credentials** after the incident — users were not logged out, prompted to reset passwords, or even notified.

It’s also worth noting: **many Petlibro devices include built-in cameras and record video**, meaning **location data, household interiors, and audio** may be transmitted through their platform — all of which are **highly sensitive** in the wrong hands.


### Why This Matters for Security & Privacy

- **Downtime isn’t just a technical inconvenience** — if the feeder can’t authenticate or connect, your pet might go unfed.
- **Access to developer tools** means anyone with the app during that window could potentially **inspect live requests**, view endpoints, or even **craft requests to internal APIs** (though fully assessing this would require deeper investigation).
- **Staging environments typically lack production-grade security** — including authentication layers, rate limits, or encrypted communications — and may expose **hardcoded keys or older, vulnerable code**.
- As noted, **many Petlibro devices include cameras and microphones**. This incident may have risked **camera feeds, voice commands, and acoustic information** being sent through test servers — potentially without sufficient protections.

And perhaps most frustratingly: **there was no communication** from Petlibro during or after the incident.

- No in-app alerts
- No email notification
- No acknowledgement on their website or social media
- No reply to my messages, sent through various channels

I’m not expecting a response. In the ~6 months I’ve owned Petlibro products, **this isn’t the first issue** — and I’ve never received a reply, a support update, or any kind of proactive communication from the company.

They do, however, manage to find the time to **send marketing emails regularly**, sometimes even the day after they have a major incident.


### Dangerous Parallels

As we continue to embed IoT into our everyday lives, it's important to consider what happens when things go wrong. This incident echoes a much larger one involving the **Petnet SmartFeeder** (a different company operating in the same space), where:

- Feeders went offline, leaving pets unfed.
- Support and communication from the company disappeared, even as users pleaded on social media and support channels went dark.
- Eventually, Petnet admitted their **cloud service lacked redundancy**, and [later shut down entirely](https://www.techdirt.com/2020/05/05/after-months-incompetence-smart-pet-feeder-company-petnet-falls-apart-blames-covid-19/) — leaving customers stranded and pets at risk.

Pets are fragile — and downtime or malfunctions can have **real-world consequences**. While I’ve never fully trusted these devices to operate without a fallback (I maintain **multi-vendor redundancy** and have a **neighbor on standby**), many people surely put too much trust in these products, assuming they "just work."


### A Broader Warning: IoT, Privacy, and Trust

Smart pet devices are part of a growing IoT and home automation ecosystem — but they come with underappreciated risks:

- **Exposed cameras:** In 2021, a Furbo pet cam was hacked — a stranger spoke to the owner through the device. These breaches pose serious privacy and security threats.
- **Insecure defaults are rampant:** A 2025 study found over **40,000 unsecured webcams** publicly streaming online, often due to default passwords or weak configurations.
- **IoT can become a gateway into your network:** If compromised, a feeder or camera could be used to pivot into other devices on your home Wi-Fi.

Based on what I've observed so far, **there’s little reason to give Petlibro the benefit of the doubt**. And so, it’s worth taking steps now to mitigate potential damage.


### How to Protect Your Pet and Your Home

- **Always have a non-internet backup feeding method** — gravity feeders, pre-portioned meals, or a trusted pet sitter.
- **Isolate IoT devices** on a guest network or VLAN to prevent access to your personal systems if one is compromised.
- **Keep firmware and apps updated** to ensure you have the latest security patches.
- **Use strong, unique passwords** and enable two-factor authentication if available.
- **Cover or disable cameras/mics when not needed**, and place them carefully — mine points only at a wall.
- **Monitor device behavior regularly** — look out for unexpected logouts, failed requests, or unusual API activity.
- **Demand transparency and accountability** from manufacturers. If something breaks, you deserve clear communication. Even if Petlibro doesn’t respond, that doesn’t make the need for accountability any less urgent.
- **Manually reset your passwords.** Since this incident, Petlibro has not invalidated sessions or triggered password resets — users are left to assess and act on their own.

If you believe data may have been exposed, consider filing a report with:

- The **[FTC](https://reportfraud.ftc.gov)** if fraud, deception, or user harm is suspected
- The **[Cybersecurity & Infrastructure Security Agency (CISA)](https://www.cisa.gov/report)** if you believe this is part of a broader system vulnerability or infrastructure issue

Other countries typically have equivalent consumer protection and cybersecurity agencies as well.


### Final Thoughts

Technology makes our lives profoundly better — but not in every way, and not at all times. Be cautious about ceding critical responsibilities to companies whose practices don’t inspire confidence.

Petlibro makes compelling hardware and will likely remain in the market for the foreseeable future. That said, their approach to reliability, transparency, and customer communication would be unacceptable in a B2B context — and frankly, it shouldn’t be acceptable in B2C either.

**Use their products with extreme caution — protect networks and protect your 🐾**
