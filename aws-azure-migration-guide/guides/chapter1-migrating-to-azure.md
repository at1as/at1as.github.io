---
layout: default
title: "AWS to Azure Migration Case Study: Architecture, Strategy & Results"
description: "How LEAD planned its AWS to Azure infrastructure migration, including cloud credits, service mapping, cost tradeoffs, and operational decisions."
permalink: /aws-azure-migration-guide/guides/chapter1-migrating-to-azure/
last_modified_at: 2026-11-27
image:
  path: /assets/images/azure-typical-service-overview.png
  alt: "Post-migration Azure architecture diagram for LEAD's platform"
---

<nav class="guide-breadcrumb" aria-label="Breadcrumb">
  <a href="/aws-azure-migration-guide/">AWS to Azure Migration Guide</a>
  <span class="crumb-sep" aria-hidden="true">/</span>
  <span>Chapter 1 of 6</span>
</nav>

# From AWS to Azure — Migrating LEAD's Infrastructure Without Missing a Beat

<div class="chapter-meta-line">
  <span class="chapter-number">Chapter 1</span>
  <span class="reading-time-wrapper">{% include reading_time.html %}</span>
  <span class="category">Strategic Overview</span>
  <span class="migration-path"><strong>AWS</strong> → <strong>Azure</strong></span>
</div>

<div class="chapter-intro">
  <p>Chapter 1 of 6 in our series on migrating LEAD's enterprise platform from AWS to Azure — covering the business motivations, architecture mapping, and sequencing behind the move.</p>
</div>

## Overview

In 2025, we successfully migrated the infrastructure and services behind [LEAD.bot](https://www.lead.app) and [Sunrize](https://www.lead.app/sunrize-app-for-slack/) — two core components of our enterprise knowledge platform — from Amazon Web Services (AWS) to Microsoft Azure.

At the time of migration, our platform was processing over **30 million events per month**. These events power our Slack, Microsoft Teams & Outlook, and Google Calendar integrations, covering real-time user events and notifications, analytics pipelines, reporting, auditing, and the full functionality of our platform.

From the outset we knew that downtime or service degradation would be unacceptable, so we had to plan for a zero-downtime transition across a dozen services that were deeply embedded in the AWS ecosystem. We operate as a small team with the resources to dedicate a single engineer to the migration, so we needed to explore the full set of tooling available to us in order to execute the migration successfully and on schedule.

This chapter provides an overview of that migration. The following chapters cover each part of the stack in detail.


## Why We Migrated

This migration was part of a strategic move to:

- Align more deeply with the **Microsoft 365 ecosystem**, used by a majority of our enterprise customers (through integrations such as Microsoft Teams and Outlook)
- Eliminate high-maintenance EC2 infrastructure in favor of **managed, containerized services**
- **Consolidate** our integrations into a single platform where possible (OpenAI → Azure AI Foundry, etc.)
- **Reduce cost** via participation in the Microsoft for Startups program, without compromising reliability, compliance, or performance
- **Simplify** compliance, monitoring, and operational overhead


## Background: What We Do

At **LEAD**, we build enterprise tools that transform how organizations transfer knowledge, map expertise, and optimize collaboration. Our goal is to help leaders see not just what their teams are doing—but how well knowledge actually flows across the organization.

Two of our core products are:

### LEAD.bot

- LEAD.bot focuses on the human side of knowledge management (**"KM"**)
- Instead of indexing documents or static content, it maps how people connect—who shares knowledge, who gets left out, and where collaboration bottlenecks form
- By leveraging organizational network analysis (**"ONA"**) and behavioral data from platforms like Microsoft Teams, it reveals expertise, influence paths, and knowledge gaps hidden in plain sight
- Use cases include mentorship matching, manager coaching, onboarding journeys, and strategic knowledge transfer initiatives

### Sunrize

- Sunrize zooms in on collaboration quality and work patterns
- It analyzes calendars, meetings, work habits, and behavioral signals to help organizations understand how teams actually work—especially across distributed and hybrid environments
- Where LEAD.bot answers “who knows what, and who they talk to”, Sunrize adds “how they work together, and what gets in the way”

Together, LEAD.bot and Sunrize form a behavior-aware KM platform that does more than just store knowledge; it actively improves how it's shared, accessed, and amplified across an enterprise.


## What We Were Running

Before migration, our architecture spanned:

- Angular frontends served via EC2 + CloudFront
- NodeJS platform integrations on EC2
- Java Spring Boot APIs on EC2
- Python services on Fargate ECS (Flask + scheduled jobs)
- PostgreSQL on RDS
- Static content and assets in S3
- Scheduled tasks via Lambda Functions
- Route53 for DNS
- WordPress installations on Lightsail
- CloudWatch for monitoring and logs
- IAM for user management
- And more aspects of the AWS ecosystem

Some services were containerized. Some were managed via Dokku and run as containers on EC2 hosts. Over time, operational complexity had resulted in many bespoke configurations. This worked for us, but it required care and constant attention. As a result, simplification was a key goal of the migration.


## What Changed

After migration:

- All APIs and services run as containers on Azure App Service
- Databases run on Azure Database for PostgreSQL
- Static sites are served via Azure Static Web Apps and Blob Storage
- DNS is centralized in Azure DNS Zones
- Monitoring, logs, and security are consolidated under Azure Monitor and Application Insights
- Deployment slots enable zero-downtime swaps
- Azure Front Door provides CDN coverage
- Environment configuration is standardized across services

The typical architecture for our services is as follows (with some minor variations across our services):

![Overview Architecture]({{ "/assets/images/azure-typical-service-overview.png" | relative_url }})


We are already heavy users of Azure, with many services now running in the ecosystem. We plan to continue embedding deeper over time as our platform expands, and are currently very focused on machine learning pipelines and AI services:

<div style="max-width: 450px; margin-left: auto; margin-right: auto;">
<img src="{{ "/assets/images/overview-resource-chart.png" | relative_url }}" alt="Overview Resource Chart" class="width-constrained-500" />
</div>


## Downtime or Service Degradation Was Non-Negotiable

Several aspects of this migration required careful coordination:

- Database migration without losing writes
- Background scheduler cutover without duplicate job execution
- DNS changes without traffic interruption
- Container redeployments without request drops

We'll unpack the exact mechanisms in later chapters, including:

- AWS DMS logical replication and write-audit strategies for safe database migration
- Feature flags for safe scheduler cutover
- Deployment slot swap patterns
- Region alignment and networking considerations
- Handling outbound NAT throughput constraints

The migration was completed without customer-visible disruption.


## Before and After: Cloud Infrastructure Mapping

At a high level, these are the Azure equivalents we chose for each of our AWS services. Note that they are not always functionally equivalent, and we discuss the motivations for each choice within their dedicated chapters.

<div class="centered-table-large-font">
  <table>
    <thead>
      <tr>
        <th>AWS</th>
        <th>Azure</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>EC2</td>
        <td>Azure App Service</td>
      </tr>
      <tr>
        <td>ECS</td>
        <td>Azure App Service (Containers)</td>
      </tr>
      <tr>
        <td>ECS Task Definitions</td>
        <td>Azure Container Registry</td>
      </tr>
      <tr>
        <td>Lightsail</td>
        <td>Azure App Service</td>
      </tr>
      <tr>
        <td>RDS (PostgreSQL)</td>
        <td>Azure Database for PostgreSQL</td>
      </tr>
      <tr>
        <td>S3 (static sites &amp; assets)</td>
        <td>Azure Blob Storage + Static Web Apps</td>
      </tr>
      <tr>
        <td>CloudFront (CDN)</td>
        <td>Azure Front Door</td>
      </tr>
      <tr>
        <td>Route 53 (DNS)</td>
        <td>Azure DNS Zones</td>
      </tr>
      <tr>
        <td>S3 (files)</td>
        <td>Azure Blob Storage</td>
      </tr>
    </tbody>
  </table>
</div>


## What This Series Covers

This migration wasn't a single event, but done in phases (the ordering of which impacts the process). The six chapters walk through each layer of the move:

1. **Project Summary & Strategy** *(you are here)* — business context, architecture mapping, and sequencing
2. **[ECS & EC2 to Azure App Service](/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/)** — container hosting, deployment slots, and outbound NAT limits
3. **[WordPress on Bitnami to App Service](/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/)** — moving from AWS Lightsail to standard App Service and PHP-FPM tuning
4. **[Static Sites & CDN Migration](/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/)** — apex DNS constraints, Azure Storage, Front Door, and Static Web Apps
5. **[PostgreSQL Migration from AWS RDS to Azure](/aws-azure-migration-guide/guides/chapter5-azure-db-migration/)** — AWS DMS logical replication, schema restoration, and live cutover
6. **[AWS Route 53 to Azure DNS Zones](/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/)** — domain delegation, NS cutover, and alias A records

Each chapter focuses on implementation details, tradeoffs, and real-world lessons.


## Lessons at a Glance

A few high-level takeaways covered in the next chapters:

- Region selection in Azure early on matters (not all resources are available in all regions)
- NAT throughput limits need to be tested thoroughly to understand their impact on performance
- The order in which migrations occur matters, particularly when it comes to DNS (where apex records require static IPs or Azure DNS alias support)
- Deployment slots make rollbacks instantaneous and provide a reliable way to test changes against a production setup
- Standardization across different service types (e.g., WordPress vs. application services) heavily reduces operational overhead
- Migrating bespoke configurations (like Bitnami-flavored WordPress on Lightsail) is not trivial, but standard configurations pay off in the long run

Each of these deserves its own explanation — and gets one in the chapters ahead.

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
  <a href="/aws-azure-migration-guide/" class="chapter-pager-link prev">
    <span class="pager-kicker">← Guide Overview</span>
    <span class="pager-title">All Chapters</span>
  </a>
  <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="chapter-pager-link next">
    <span class="pager-kicker">Next Chapter →</span>
    <span class="pager-title">ECS &amp; EC2 to Azure App Service</span>
  </a>
</nav>