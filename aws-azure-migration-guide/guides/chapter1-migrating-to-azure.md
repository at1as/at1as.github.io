---
layout: default
title: "From AWS to Azure — Migrating LEAD's Infrastructure Without Missing a Beat"
permalink: /aws-azure-migration-guide/guides/chapter1-migrating-to-azure/
---

# From AWS to Azure — Migrating to Azure

<div class="chapter-meta-line">
  <span class="chapter-number">Chapter 1</span>
  <span class="reading-time-wrapper">{% include reading_time.html %}</span>
  <span class="category">Strategic Guide</span>
  <span class="migration-path"><strong>AWS</strong> → <strong>Azure</strong></span>
</div>
<div class="chapter-intro">
This is <b>Part I</b> of our ongoing series on migrating LEAD's enterprise platform from AWS to Azure. This chapter covers the executive summary and strategic overview of our migration journey.

<div class="chapter-nav">
  <a href="/aws-azure-migration-guide/" class="chapter-nav-button home">
    <i class="fas fa-home"></i> Home
  </a>
  <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="chapter-nav-button next">
    Next Chapter: App Service Migration<span class="arrow">→</span>
  </a>
</div>
</div>

## Overview

In 2025, we successfully migrated the infrastructure and services behind [LEAD.bot](https://www.lead.app) and [Sunrize](https://www.lead.app/sunrize-app-for-slack/) — two core components of our enterprise knowledge platform — from Amazon Web Services (AWS) to Microsoft Azure.

At the time of migration, our platform was processing over **30+ million events per month**. These events power our Slack, Microsoft Teams & Outlook, and Google Calendar integrations, covering real time user events and notifications, analytics pipelines, reporting, auditing, and the full functionality of our platform.

From the outset we knew that downtime or service degradation would be unacceptable, so we had to plan for a zero-downtime transition, across a dozen services that were deeply embedded in the AWS ecosystem. We operate as a small team with the resources to dedicate a single engineer to the migration, so we needed to explore the full set of tooling available to us in order to execute the migration successfully and on schedule.

This post will provide an overview of that migration. The following chapters are dedicated to each specific aspect of the migration.


## Why We Migrated

This migration was part of a strategic move to:

- Align more deeply with **Microsoft 365 ecosystem**, used by a majority of our Enterprise customers (through integration such as Microsoft Teams and Outlook)
- Eliminate high maintenance EC2 infrastructure in favor of **managed, containerized services**
- **Consolidate** our integrations into a single platform, where possible (OpenAI -> Azure Foundary, etc)
- **Reduce cost** via participation in the Microsoft for Startups program, without compromising reliability, compliance, or performance
- **Simplify** compliance, monitoring, and operational overhead


## Background: What We Do

At <b>LEAD</b>, we build enterprise tools that transform how organizations transfer knowledge, map expertise, and optimize collaboration. Our goal is to help leaders see not just what their teams are doing—but how well knowledge actually flows across the organization.

Two of our core products are:

### 🔹 LEAD.bot

- LEAD.bot focuses on the human side of knowledge management (<b>"KM"</b>)
- Instead of indexing documents or static content, it maps how people connect—who shares knowledge, who gets left out, and where collaboration bottlenecks form
- By leveraging organizational network analysis (<b>"ONA"</b>) and behavioral data from platforms like Microsoft Teams, it reveals expertise, influence paths, and knowledge gaps hidden in plain sight
- Use cases include mentorship matching, manager coaching, onboarding journeys, and strategic knowledge transfer initiatives

### 🔹 Sunrize

- Sunrize zooms in on collaboration quality and work patterns
- It analyzes calendars, meetings, work habits, and behavioral signals to help organizations understand how teams actually work—especially across distributed and hybrid environments
- Where LEAD.bot answers “who knows what, and who they talk to”, Sunrize adds “how they work together, and what gets in the way”

Together, LEAD.bot and Sunrize form a behavior-aware KM platform that does more than just store knowledge; it actively improves how it's shared, accessed, and amplified across an enterprise


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

Some services were containerized. Some were managed via Dokku and run as containers on EC2 hosts. Over time, operational complexity had resulted in many bespoke configurations. This worked for us, but it required care and constant attention. As a result, simplicification was a key goal of the migration.


## What Changed

After migration:

- All APIs and services run as containers on Azure App Service
- Databases run on Azure Database for PostgreSQL
- Static sites are served via Azure Static Web Apps and Blob Storage
- DNS is centralized in Azure DNS Zones
- Monitoring, logs, and security are consolidated under Azure Monitor and Application Insights
- Deployment slots enable zero-downtime swaps
- Azure Front Door provides a CDN coverage
- Environment configuration is standardized across services

The typical architecture for our services is as follows (with some minor variations across our services):

![Overview Architecture]({{ "/assets/images/azure-typical-service-overview.png" | relative_url }})


We are already heavy users of Azure, with many services now running in the ecosystem. We plan to continue embedding deeper over time as our platform expands, and are currently very focused on Machine Learning pipelines and AI services:

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

- Write-audit strategies for safe database migration
- Feature flags for safe scheduler cutover
- Deployment slot swap patterns
- Region alignment and networking considerations
- Handling outbound NAT throughput constraints

The migration was completed without customer-visible disruption.


## Before and After: Cloud Infrastructure Mapping

At a high level, these are the Azure equivalents we chose for each of our AWS services. Note that they are not always functionally equivalent, but we'll discuss the motivations for each choice within their dedicated chapters.

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
        <td>LightSail</td>
        <td>Azure App Service</td>
      </tr>
      <tr>
        <td>RDS (Postgres)</td>
        <td>Azure Database for PostgreSQL</td>
      </tr>
      <tr>
        <td>S3 (static sites & assets)</td>
        <td>Azure Blob Storage + CDN</td>
      </tr>
      <tr>
        <td>CloudFront (CDN)</td>
        <td>Azure CDN</td>
      </tr>
      <tr>
        <td>Route53 (DNS)</td>
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

This migration wasn't a single event, but done in phases (the ordering of which impacts the process). We'll cover the following aspects of it in the following chapters:

**Part I — Strategic Migration**
- Guide summary and business context _(you are here!)_

**Part II — Container Migration**
- [ECS & EC2 to Azure App Service](/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/)
- [WordPress migration](/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/)
- [Static sites and CDN setup](/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/)

**Part III — Database Migration**
- [Zero-downtime PostgreSQL strategy](/aws-azure-migration-guide/guides/chapter5-azure-db-migration/)

**Part IV — Network & Infrastructure**
- [Azure DNS Zones and internal routing patterns](/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/)

**Part V — Machine Learning**
- <span class="coming-soon">(Coming Soon!) [Migration of ML pipelines and AI workflows to Azure-native services](/aws-azure-migration-guide/guides/chapter7-machine-learning-migration/)</span>

Each chapter focuses on implementation details, tradeoffs, and real-world lessons.


## Lessons at a Glance

A few high-level takeaways covered in the next chapters:

- Region selection in Azure early on matters (not all resources are available in all regions)
- NAT Throughput limits need to be tested thoroughly, to understand their impact on performance
- The order in which migrations occur is a relevant factor, particlarly when it comes to DNS (in which Apex records require static IP addresses)
- Deployment slots make rollbacks instantaneous, and provide a valid environment to test with a production setup
- Standardization across different service types (eg. wordpress vs applcation sevices) heavily reduces operational overhead
- Migrations of bespoke configurations (like Bitnami flavored WordPress on Lightsail) are not trivial, but standard configurations pay off in the long run

Each of these deserves its own explanation — and will get one

<div class="next-chapter-section">
  <a href="/aws-azure-migration-guide/" class="back-to-toc">← Back to Guide Overview</a>
  <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="next-chapter-button">
    <span class="button-content">
      <span class="button-text">Next Chapter</span>
      <span class="button-subtitle">ECS & EC2 to Azure App Service</span>
      <span class="arrow">→</span>
    </span>
  </a>
</div>