---
layout: default
title: "WordPress on Bitnami to Azure App Service Migration"
permalink: /aws-azure-migration-guide/guides/chapter3-wordpress-bitnami-to-app-service/
---

# WordPress on Bitnami to Azure App Service Migration

<div class="chapter-meta-line">
  <span class="chapter-number">Chapter 3</span>
  <span class="reading-time-wrapper">{% include reading_time.html %}</span>
  <span class="category">Migration Guide</span>
  <span class="migration-path"><strong>WordPress</strong> → <strong>App Service</strong></span>
</div>

<div class="chapter-intro">
This is <b>Part III</b> of our ongoing series on migrating LEAD's enterprise platform from AWS to Azure. This chapter covers the migration of our WordPress properties from AWS Lightsail with Bitnami to Azure App Service.

<div class="chapter-nav">
  <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="chapter-nav-button back">
    <span class="arrow">←</span>Previous Chapter
  </a>
  <a href="/aws-azure-migration-guide/" class="chapter-nav-button home">
    <i class="fas fa-home"></i> Home
  </a>
  <a href="/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/" class="chapter-nav-button next">
    Next Chapter: Static Sites & CDN<span class="arrow">→</span>
  </a>
</div>
</div>

## Overview

Migrating WordPress from AWS Lightsail with Bitnami to Azure App Service presented some unique challenges. While Bitnami provides an opinionated, bespoke WordPress installation, Azure App Service offers a more standardized approach with many enhanced features built in, such as deployment slots, managed certificates, integrated monitoring, and more.

As extensions we use often require specific PHP versions for WordPress versions, and Bitnami on AWS had no straightforward upgrade path beyond the OS supported versions, we were in search of a more standardized approach. Bitnami also confused any contractors we hired for site maintenance, so we had multiple motivations for this migration.

This guide covers the combined learnings from the migration process we followed to move both of our WordPress properties to Azure App Service.

Note that our approach did not rely heavily upon tooling, as we're comfortable with server configuration and management, but there are many tools available and this approach may not be the correct one for all teams.

We're engineers and not WordPress experts, so we surely lack a significant amount of domain expertise in this space.


## Prerequisites

- Azure subscription
- Access to AWS Lightsail instance (Source)
- SSH (or SCM) access to both environments
- WordPress admin credentials
- Custom domain access (DNS management)

## Resource Comparison

| **AWS Lightsail** | **Azure App Service (P1v3)** |
|-------------------|------------------------------|
| 2GB RAM           | 4GB RAM                      |
| 2 vCPUs           | 1 vCPU                       |
| 60GB SSD          | 250GB storage                |
| Bitnami WordPress | Standard WordPress           |


## Step 1: Create Azure App Service

### Create New WordPress App Service

1. **Navigate to Azure Portal** → **Create App Service**
2. **Select WordPress** from the marketplace
3. **Configure settings:**
   - Use the default Azure-provided domain initially
   - Link to subscription
   - Configure networking and scaling as needed
   - (Optional) Plan for Azure Front Door or CDN integration if desired

### Access New App Services

Wait ~10 minutes for services to provision. Then try the default domain for each App Service.

## Step 2: Export WordPress from AWS

### Choose Migration Plugin

We evaluated two plugins for migration: **All-In-One WP Migration** and **Duplicator**:

- **All-In-One WP Migration**: Free, requires manual upload limit adjustments
- **Duplicator**: Requires Pro subscription for large imports

We elected to use **All-In-One WP Migration** for both migrations.

### Export Process

1. Install **All-In-One WP Migration** on source site
2. Create complete backup
3. Download export file locally

Note that our exports were on the order of ~10GB, so storing them locally was an option for us.


## Step 3: Prepare Azure for Import

### Configure Upload Limits

Since Azure has default upload restrictions, modify PHP settings:

```bash
# SSH via Kudu (App Service → Development Tools → Advanced Tools → SSH)
cd /home/site
mkdir ini
cd ini

# Create custom PHP settings
echo "upload_max_filesize=12G" > extensions.ini
echo "post_max_size=12G" >> extensions.ini
echo "memory_limit=256M" >> extensions.ini
echo "max_execution_time=300" >> extensions.ini
echo "max_input_time=300" >> extensions.ini

chmod 644 /home/site/ini/extensions.ini
```

### Add PHP Configuration

1. **App Service → Settings → Environment Variables → Add New**
   - **Name**: `PHP_INI_SCAN_DIR`
   - **Value**: `/usr/local/etc/php/conf.d:/home/site/ini`

### Debug PHP Settings (Optional)
```bash
cd /home/site/wwwroot
echo "<?php phpinfo(); ?>" > phpinfo.php
# Visit: https://<SITE_URL>/phpinfo.php
# Remove after debugging:
rm phpinfo.php
```

## Step 4: Import WordPress

### Disable Problematic Plugins

Before importing, disable plugins that may cause conflicts:

- W3 Total Cache (may cause compatibility issues)
- Note: Disabling Smush can break wp-admin, leave as-is

### Perform Import

1. **Upload All-In-One WP Migration** on destination
2. **Import the backup file** (may take several minutes)
3. **Monitor logs** if import fails:
   - Check via Kudu Console
   - Inspect /home/LogFiles/
   - or tail PHP logs if avaiable `tail -f /var/log/php-fpm/php-fpm.www.log`

### Common Import Errors

**W3TC Cache Error:**
```bash
Uncaught Error: Call to undefined method W3TC\ObjectCache_WpObjectCache::get_multiple()
```

**Solution:**
```bash
mv /var/www/wordpress/wp-content/object-cache.php /var/www/wordpress/wp-content/object-cache.php.bak
```

## Step 5: Verify Migration

### Post-Import Checklist

1. **Load website** at Azure URL
   - Test all navigation links
   - Verify images render correctly
   - Check for hardcoded old domain URLs

2. **Performance Testing**
   - Run [Google PageSpeed](https://pagespeed.web.dev/) test
   - Compare with Lightsail performance

3. **WordPress Admin**
   - Login with original credentials
   - **Settings → General**: Verify WordPress Address and Site Address
   - Check all functionality works correctly

### Performance Comparison

| **Hosting** | **Desktop** | **Mobile** |
|--------------|-------------|------------|
| Lightsail    | 72 (72, 94, 74, 100) | 25 (25/92/71/100) |
| Azure P0V3   | 54 | --- |
| Azure P1V3   | 66 (66, 94, 96, 100) | 33 (33, 92, 96, 100) |

This compared our optmized Lightsail setup with our basic Azure setup.

## Step 6: Performance Optimization

### PHP-FPM Configuration

Azure's default PHP-FPM configuration may cause memory issues:
```bash
# Check current configuration
cat /usr/local/etc/php-fpm.d/zz-docker.conf
```

### Typical defaults (too high):
```bash
pm = dynamic
pm.max_children = 50
pm.start_servers = 20
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```
Since App Service containers are ephemeral, we re-apply this configuration at startup.

### Optimize PHP-FPM Settings
```bash
# Backup original config
cp /usr/local/etc/php-fpm.d/zz-docker.conf /home/zz-docker.conf

# Create optimized configuration
cat > /home/zz-docker.conf << EOF
pm = dynamic
pm.max_children = 15
pm.start_servers = 5
pm.min_spare_servers = 2
pm.max_spare_servers = 10
EOF

# Create startup script to persist settings
cat > /home/startup.sh << 'EOF'
#!/bin/bash
cp /home/zz-docker.conf /usr/local/etc/php-fpm.d/zz-docker.conf
echo "✅ Applied custom PHP-FPM config"
EOF

chmod +x /home/startup.sh
```
Note that we adjusted these settings to avoid OOM errors and memory pressure issues"

#### Before (Default):
```bash
App Service Container
 ├── PHP-FPM (max_children = 50)
 ├── Memory Pressure
 └── OOM Risk
```
#### After (Tuned):
```bash
App Service Container
 ├── PHP-FPM (max_children = 15)
 ├── Stable Memory
 └── Predictable Throughput
```

### Add Startup Command

**Azure Portal → Configuration → Startup Command**: `/home/startup.sh`

### Plugin Optimization

Disable resource-intensive plugins:
```bash
wp plugin deactivate ninja-forms mailchimp-for-wp elementor elementskit-lite pro-elements revslider --allow-root --path="/home/site/wwwroot"
```

Update WordPress core:
```bash
wp core update --allow-root --path="/home/site/wwwroot"
```

Re-enable plugins one by one to identify issues:
```bash
wp plugin activate elementor --allow-root --path="/home/site/wwwroot"
```

If running heavy CLI operations on smaller SKUs, use `nice` to reduce CPU contention:
```bash
nice -n 10 wp plugin activate elementor --allow-root --path="/home/site/wwwroot"
```

## Step 7: Domain Transfer

If DNS is managed externally (e.g., Route53), add a custom domain in Azure for certificate management and update DNS records to point to the correct App Service endpoint.

### Add Custom Domain

1. **App Services → Settings → Custom Domains → Add Custom Domain**
2. **Domain Provider**: Select "All Other Domain Services"
3. **Domain**: Enter your domain (e.g., `example.com`)
4. **DNS Validation**: Add displayed records at your DNS provider
5. **Verify** domain ownership

### SSL Certificates

1. **Add Binding** for custom domain
2. **Create App Service Managed Certificate**
3. **Wait for certificate** (can take 10 minutes to several hours)

### Update WordPress URLs
```bash
# Update WordPress URLs
wp option update siteurl 'https://www.example.com' --allow-root
wp option update home 'https://www.example.com' --allow-root

# Replace old URLs in database
wp search-replace '<OLD_SITE_NAME>.azurewebsites.net' 'www.example.com' --precise --allow-root --skip-columns=guid
```

### Update wp-config.php

Add the following to your wp-config.php file to point to the new domain:

```php
// Add to wp-config.php
define('WP_HOME', 'https://www.example.com');
define('WP_SITEURL', 'https://www.example.com');
```

## Step 8: Post-Migration Cleanup

### Clear Temporary Files
```bash
# Remove PHP info page
rm /home/site/wwwroot/phpinfo.php

# Remove upload limit overrides
rm -r /home/site/ini/*

# Remove backup directory (once stable)
rm -rf /home/backup
```

### Update Email Configuration

Update Post SMTP settings to use correct domain:
1. **Post SMTP → Settings**
2. Update From Email address
3. Test email functionality

### Cache Management
```bash
# Clear theme cache
mv /home/site/wwwroot/wp-content/themes/<THEME>/{cache,cache2} /home/site/wwwroot/wp-content/themes/<THEME>/cache_backup/

# Flush WordPress cache
wp cache flush --allow-root
```

### Shutdown Old Service on AWS

We waited several weeks to ensure stability and feel confident a rollback was not necessary before removing the AWS resources.


## Step 9: Advanced Configuration

### Health Monitoring

Install a health endpoint plugin if needed to expose `/health` returning HTTP 200 for load balancer checks.

### SSL Certificate Management

Azure manages SSL certificates automatically, but MySQL SSL requires attention:
```bash
# Check SSL configuration
wp db cli --allow-root
status;  # Verify TLS connection
```

### Deployment Slots

Deployment slots allow creating a standby instance without traffic routed to it to test changes before going live. This allows zero downtime deployments and rollbacks:

```bash
Production Slot  ← live traffic
Staging Slot     ← test environment

Swap → Zero downtime deployment
```

### Performance Enhancement with Caching

Enable **W3 Total Cache** (pre-configured for Azure):
- FrontDoor CDN integration
- Redis object cache
- Database caching
- **Note**: Avoid minification initially to prevent rendering issues

### Cost Monitoring

Monitor Azure spend through the Azure Portal or cost management tools. If using sponsorship credits, ensure budgets and alerts are configured.


## Troubleshooting

### Common Issues

**Memory Issues:**
- Scale up to P1V3 if experiencing OOM errors
- Monitor via "Diagnose and Solve Problems" → "Web App Down"

**Plugin Conflicts:**
- Disable problematic plugins (ex. Elementskit-lite if rendering issues occur)
- Update plugins to latest versions
- Test plugins individually

**Domain Issues:**
- Ensure both www and non-www domains have certificates (if applicable)
- Use Azure DNS Zones for better A record management

### Performance Monitoring

Use Azure's built-in tools:
- **Application Insights** for performance monitoring
- **Diagnose and Solve Problems** for issue detection
- **Memory Usage** metrics for optimization

## Advantages of Azure App Service

- **Deployment Slots** for zero-downtime deployments and testing of new versions
- **Managed Certificates** (no manual SSL management)
- **Integrated Monitoring** (Application Insights)
- **Built-in CDN** (FrontDoor)
- **Mmanaged identities**
- **Automated Backups**
- **Seamless Vertical and horizontal scalability** (Lightsail only offers vertical scalabiling)

## Migration Timeline

| **Phase** | **Duration** | **Key Activities** |
|-----------|--------------|-------------------|
| Preparation | 30 minutes | Create App Service, configure settings |
| Export | 15 minutes | Backup WordPress from AWS |
| Import | 60+ minutes | Import to Azure, resolve errors |
| Optimization | 45 minutes | Performance tuning, plugin management |
| Domain Transfer | 30-180 minutes | DNS setup, SSL certificates |
| Cleanup | 15 minutes | Remove temporary files, final testing |

## Lessons Learned

#### Before
```bash
Internet
   ↓
Route53
   ↓
Lightsail Instance
   ├── Apache
   ├── PHP
   ├── MySQL (local)
   └── Bitnami stack
```

#### After
```bash
Internet
   ↓
External DNS
   ↓
Azure Front Door
   ↓
Azure App Service (P1v3)
   ├── WordPress
   ├── PHP-FPM
   ├── Managed Certificate
   ├── Deployment Slot
   └── Application Insights
   ↓
Azure Database for MySQL
```

### ✅ **Success Factors**
- Use All-In-One WP Migration for large sites
- Optimize PHP-FPM settings for Azure environment
- Test plugins individually after migration
- Monitor performance and scale as needed

### ⚠️ **Watch Out For**
- CLI operations can crash server (use `nice` prefix)
- Azure URL remnants in WordPress configuration
- Deployment slot failures require CLI resolution
- Certificate provisioning can take hours

### 🔧 **Optimization Tips**
- Start with P1V3 tier for better performance
- Enable W3 Total Cache after stabilization
- Use deployment slots for testing
- Monitor memory usage and adjust PHP-FPM accordingly

## Conclusion

Migrating WordPress from Bitnami on AWS Lightsail to Azure App Service provides significant benefits including deployment slots, managed certificates, and integrated monitoring. While the migration requires careful attention to PHP configuration and plugin compatibility, the result is a more scalable, maintainable WordPress installation with strong Azure ecosystem integration.

The migration process typically takes 3–4 hours for a complete site, with most time spent on import and domain transfer. Post-migration optimization can further improve performance and long-term stability.

<div class="next-chapter-section">
  <a href="/aws-azure-migration-guide/guides/chapter2-migrating-to-app-service/" class="back-to-toc">
    <i class="fas fa-arrow-left"></i> Previous Chapter
  </a>
  <a href="/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/" class="next-chapter-button">
    <span class="button-content">
      <span class="button-text">Next Chapter</span>
      <span class="button-subtitle">Static Sites & CDN Migration</span>
      <span class="arrow">→</span>
    </span>
  </a>
</div>