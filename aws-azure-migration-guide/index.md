---
layout: default
title: "AWS to Azure Migration Guide"
description: "A 6-chapter production case study on migrating containers, WordPress, PostgreSQL, static sites, CDN, and DNS from AWS to Azure."
permalink: /aws-azure-migration-guide/
last_modified_at: 2026-11-27
image:
  path: /assets/images/azure-typical-service-overview.png
  alt: "Post-migration Azure architecture using Container Registry, App Service deployment slots, Azure Database for PostgreSQL, and Application Insights"
---

<div class="migration-guide-container">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb">
    <a href="/sites/">Projects</a>
    <span class="crumb-sep" aria-hidden="true">/</span>
    <span>AWS to Azure Migration Guide</span>
  </nav>

  <header class="migration-guide-header page-intro">
    <h1>AWS to Azure Migration Guide</h1>
    <p>Field notes from migrating LEAD's production platform — processing 30M+ monthly events — from AWS to Azure without customer-visible disruption</p>
  </header>

  <div class="guide-overview-meta">
    <div class="book-info">
      <span class="book-info-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
        <span>{% assign total_time = 0 %}{% for p in site.pages %}{% if p.url contains "/aws-azure-migration-guide/guides/chapter" and p.noindex != true %}{% assign page_time = p | reading_time_from_file %}{% assign total_time = total_time | plus: page_time %}{% endif %}{% endfor %}{{ total_time }} min total read</span>
      </span>
      <span class="book-info-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span>6 chapters</span>
      </span>
      <span class="book-info-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Production case study</span>
      </span>
    </div>
    <a href="/aws-azure-migration-guide/guides/chapter1-migrating-to-azure/" class="guide-start-link">
      Start with Chapter 1 <span aria-hidden="true">→</span>
    </a>
  </div>

  <section id="chapters" class="guide-section" aria-labelledby="chapters-heading">
    <div class="guide-section-heading">
      <h2 id="chapters-heading">Chapters</h2>
      <span>Read in sequence or jump to a service</span>
    </div>

    <div class="toc-chapters-list">
      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter1-migrating-to-azure/" class="chapter-link">
          <div class="chapter-number">01</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>Project Summary &amp; Architecture Strategy</h3>
              <span class="read-time">{% assign chapter1 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter1-migrating-to-azure/" | first %}{{ chapter1 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Business drivers, AWS-to-Azure service mapping, and the sequencing decisions behind LEAD's cloud migration</p>
            <div class="chapter-meta">
              <span class="services">AWS → Azure</span>
            </div>
          </div>
        </a>
      </div>

      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="chapter-link">
          <div class="chapter-number">02</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>Amazon ECS &amp; EC2 to Azure App Service</h3>
              <span class="read-time">{% assign chapter2 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" | first %}{{ chapter2 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Container runtime tradeoffs, zero-downtime deployment slots with scheduler guards, and handling outbound NAT limits</p>
            <div class="chapter-meta">
              <span class="services">ECS &amp; EC2 → App Service</span>
            </div>
          </div>
        </a>
      </div>

      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/" class="chapter-link">
          <div class="chapter-number">03</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>WordPress on Bitnami (Lightsail) to App Service</h3>
              <span class="read-time">{% assign chapter3 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/" | first %}{{ chapter3 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Moving large Bitnami WordPress sites to standard App Service, tuning PHP-FPM memory limits, and switching custom domains</p>
            <div class="chapter-meta">
              <span class="services">Lightsail WordPress → App Service</span>
            </div>
          </div>
        </a>
      </div>

      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/" class="chapter-link">
          <div class="chapter-number">04</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>Static Sites &amp; CDN Migration</h3>
              <span class="read-time">{% assign chapter4 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/" | first %}{{ chapter4 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Working around apex DNS constraints across Azure Storage, Front Door CDN invalidation, and Azure Static Web Apps</p>
            <div class="chapter-meta">
              <span class="services">S3 &amp; CloudFront → Storage / Front Door / Static Web Apps</span>
            </div>
          </div>
        </a>
      </div>

      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter5-azure-db-migration/" class="chapter-link">
          <div class="chapter-number">05</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>PostgreSQL Migration from AWS RDS to Azure</h3>
              <span class="read-time">{% assign chapter5 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter5-azure-db-migration/" | first %}{{ chapter5 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Continuous logical replication with AWS DMS, schema cleanup for dropped constraints, and live production cutover</p>
            <div class="chapter-meta">
              <span class="services">RDS PostgreSQL → Azure Database</span>
            </div>
          </div>
        </a>
      </div>

      <div class="toc-chapter">
        <a href="/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/" class="chapter-link">
          <div class="chapter-number">06</div>
          <div class="chapter-info">
            <div class="chapter-info-top">
              <h3>AWS Route 53 to Azure DNS Zones</h3>
              <span class="read-time">{% assign chapter6 = site.pages | where: "url", "/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/" | first %}{{ chapter6 | reading_time_from_file }} min</span>
            </div>
            <p class="chapter-description">Delegating domains from external registrars to Azure DNS Zones to unlock alias A records and centralized domain management</p>
            <div class="chapter-meta">
              <span class="services">Route 53 → Azure DNS Zones</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <section class="guide-section" aria-labelledby="matrix-heading">
    <div class="guide-section-heading">
      <h2 id="matrix-heading">Service Migration Matrix</h2>
      <span>AWS source to Azure destination</span>
    </div>

    <div class="migration-matrix">
      <table>
        <thead>
          <tr>
            <th>AWS Service</th>
            <th>Azure Service</th>
            <th>Complexity</th>
            <th>Chapter</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ECS &amp; EC2</td>
            <td>Azure App Service</td>
            <td><span class="complexity-badge complexity-medium">Medium</span></td>
            <td><a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/">Chapter 2</a></td>
          </tr>
          <tr>
            <td>Lightsail (Bitnami WordPress)</td>
            <td>Azure App Service</td>
            <td><span class="complexity-badge complexity-medium">Medium</span></td>
            <td><a href="/aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/">Chapter 3</a></td>
          </tr>
          <tr>
            <td>S3 &amp; CloudFront</td>
            <td>Blob Storage, Front Door &amp; Static Web Apps</td>
            <td><span class="complexity-badge complexity-low">Low</span></td>
            <td><a href="/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/">Chapter 4</a></td>
          </tr>
          <tr>
            <td>RDS PostgreSQL</td>
            <td>Azure Database for PostgreSQL</td>
            <td><span class="complexity-badge complexity-high">High</span></td>
            <td><a href="/aws-azure-migration-guide/guides/chapter5-azure-db-migration/">Chapter 5</a></td>
          </tr>
          <tr>
            <td>Route 53</td>
            <td>Azure DNS Zones</td>
            <td><span class="complexity-badge complexity-medium">Medium</span></td>
            <td><a href="/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/">Chapter 6</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="guide-section" aria-labelledby="lessons-heading">
    <div class="guide-section-heading">
      <h2 id="lessons-heading">Key Takeaways</h2>
      <span>What surprised us in production</span>
    </div>

    <div class="lessons-grid">
      <div class="lesson-card">
        <div class="lesson-card-header">
          <span class="lesson-badge warning" aria-hidden="true">!</span>
          <h3>Azure NAT Throughput</h3>
        </div>
        <p>App Service shares outbound NAT differently than EC2 — load-test bursty outbound traffic early</p>
      </div>

      <div class="lesson-card">
        <div class="lesson-card-header">
          <span class="lesson-badge success" aria-hidden="true">✓</span>
          <h3>Deployment Slots</h3>
        </div>
        <p>Slot swaps with slot-sticky settings enable instantaneous zero-downtime deploys and one-click rollbacks</p>
      </div>

      <div class="lesson-card">
        <div class="lesson-card-header">
          <span class="lesson-badge warning" aria-hidden="true">!</span>
          <h3>Region Consistency</h3>
        </div>
        <p>Check SKU availability across services before deploying to avoid cross-region app-to-database latency</p>
      </div>

      <div class="lesson-card">
        <div class="lesson-card-header">
          <span class="lesson-badge success" aria-hidden="true">✓</span>
          <h3>Centralized Observability</h3>
        </div>
        <p>Application Insights, Azure Monitor, and Microsoft Defender consolidate logging and compliance out of the box</p>
      </div>
    </div>
  </section>
</div>
