---
layout: default
title: "Azure Database Migration"
permalink: /aws-azure-migration-guide/guides/chapter5-azure-db-migration/
---

# PostgreSQL Migration from AWS RDS to Azure: How We Cut Over with (Almost**) Zero Downtime

<div class="chapter-meta-line">
  <span class="chapter-number">Chapter 5</span>
  <span class="reading-time-wrapper">{% include reading_time.html %}</span>
  <span class="category">Infrastructure Guide</span>
  <span class="migration-path"><strong>RDS</strong> → <strong>Azure Database</strong></span>
</div>

<div class="chapter-intro">
  This is <b>Part V</b> of our ongoing series on migrating LEAD's enterprise platform from AWS to Azure. This chapter covers the migration of our Postgres Databases from AWS RDS to Azure Database for PostgreSQL.
  <div class="chapter-nav">
  <a href="/aws-azure-migration-guide/guides/chapter4-static-sites-cdn-migration/" class="chapter-nav-button back">
    <span class="arrow">←</span>Previous Chapter
  </a>
  <a href="/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/" class="chapter-nav-button next">
    Next Chapter: DNS Migration<span class="arrow">→</span>
  </a>
</div>
</div>

Our PostgreSQL instance at Sunrize runs under constant write pressure, 24 hours a day. There is no natural quiet window where connections drain and background jobs pause; the system is always doing something.

When we decided to move from AWS RDS to Azure Database for PostgreSQL, the constraint was straightforward: keep the application online. The database cutover itself — switching the application to the new host — needed to happen without downtime.

The only interruption we agreed to accept was a short RDS reboot (< 4 minutes) required to enable logical replication before migration work began (we'll discuss more on this below, including how we could have avoided it in exchange for a much more involved migration process).

This chapter walks through the architecture we used, the tradeoffs we made, and what we would change if we had to do it again.


## The Setup

Our RDS instance wasn't particularly exotic — a `db.t3.micro` running PostgreSQL 14, with 128GiB of storage set to auto-scale and around 200 million rows in our largest table. The burstable CPU class meant we weren't paying for sustained performance, but it also meant we had to be careful about sustained load during migration. In many ways we already staring to outgrow the instance class.

Despite the small instance, it contained several hundred million rows and wrote at least 25M rows per month.

For Azure, we decided to scale things up and settled on a `Standard_D2ds_v4` — two vCores, 8GiB RAM, and up to 5000 IOPS on SSD. It is a major step up from the RDS instance on nearly every spec, and zone redundancy is included.

One complication upfront: we migrated our application layer to Azure first, using the US East 1 region, however we later found out that our Azure subscription didn't have permission to provision this database class in East US 1. That introduced a small cross-region latency (US East 1 to US East 2) between our app servers and the database. It was acceptable for the short term, but required a migration of the application layer to US East 2 for co-location in a future phase.


## Picking the Migration Tool

Azure's migration tooling is capable, but our requirement was continuous replication with minimal disruption. We chose AWS Database Migration Service (DMS) because it integrates cleanly with RDS logical replication and supports:

- Initial full load
- Ongoing change data capture (CDC)
- Validation during replication
- Running in the same VPC as the Source RDS database

DMS supports continuous replication via logical decoding, which is exactly what our zero-downtime migration required:

1. <b>copy the full dataset</b>
2. then <b>keep replicating</b> changes until you're ready to cut over

The key insight is that you don't have to stop anything, or cut over at a certain time or within a specific window, you just run two systems in parallel until you're confident the new one is ready.

Here's how the pieces fit together:

<image src="{{ "/assets/images/db-cutover-arch.png" | relative_url }}" alt="DMS Migration Architecture" />

DMS sits in the middle, reading from the RDS WAL via a logical replication slot and writing to Azure. During the initial full load it bulk-copies all rows; after that it switches to continuous CDC (Change Data Capture), replaying every insert, update, and delete in near real-time. Your application keeps reading and writing to RDS the whole time. When you're ready to cut over, you flip the connection string and DMS stops being needed.


## The One Unavoidable Downtime: Enabling Logical Replication

Before DMS can do any of this, RDS needs to have logical replication enabled. This requires setting:

```
rds.logical_replication = 1
```
in a custom parameter group — and because it's a static parameter, a reboot of the DB instance is required for the change to take effect.

There's no way around this on standard RDS PostgreSQL. It's a hard constraint from AWS, and this parameter is disabled by default.

We debated whether or not this was acceptible. Sunrize performs actions every 15 minutes under constant write pressure, with premium accounts given priority. We have a roughly 10 minute window under which we can disable our jobs at the application layer and expect no impact on premium accounts. We were lucky to have this window, and ultimately decided to accept this rather than engineering a more complex solution.


In any case, what you *can* do is tailor this to a low-traffic period (does not exist for our workflow, but in the worst case data loss on a weekend would be more acceptable to our users), schedule it in advance, communicate it to users, and budget around 4–5 minutes. That's a very different thing from an unplanned outage during migration.

One alternative worth knowing about: if you're on **Aurora PostgreSQL**, you can use blue/green deployments to enable logical replication on the green (staging) instance before promoting it, which reduces the app-visible downtime to under a minute during switchover. Logical replication requires making manual updates to static database parameters before you can create a blue/green deployment, which necessitates a database restart — but you can do this restart on the green instance before it becomes production, which avoids the downtime on the live system. We were on standard RDS, not Aurora, so this path wasn't available to us.

The bottom line: **schedule the reboot before you start DMS setup**, treat it as its own maintenance event, and then run the full migration with zero additional downtime.


## Configuring the Source (RDS)

Getting RDS ready for DMS-based logical replication requires a few changes that aren't obvious from the docs.

**Logical replication** isn't on by default. Create a custom parameter group (the default group can't be modified), set `rds.logical_replication = 1`, and add `pglogical` to `shared_preload_libraries`. Modify the database to use the new parameter group, then reboot.

As noted above, this reboot is unavoidable — it's a static parameter that requires a restart to take effect. On our instance it took about 4 minutes. Plan for it as a separate maintenance window before starting DMS.

After the restart, verify it took:

```sql
SHOW rds.logical_replication;
-- Should return: on
```

Then enable the extension:

```sql
CREATE EXTENSION pglogical;
```

The DMS user requires replication privileges:

```sql
GRANT rds_replication TO <DATABASE_USER>;
```

#### Logical Decoding Memory

We reviewed `logical_decoding_work_mem` before starting. On small instances, the default can be conservative. If memory headroom exists, increasing it reduces spill-to-disk behavior during heavy logical decoding. Our instance had sufficient headroom, so we increased it modestly.

#### LOB Mode Constraint

DMS in Full LOB mode requires LOB columns to be nullable. We had a TEXT NOT NULL column (user_company.role) that needed adjustment:

```sql
ALTER TABLE public.user_company ALTER COLUMN role DROP NOT NULL;
```

We restored the constraint after migration. The column is never NULL in practice, which we enforce at the application layer, so this constraint was more a guard against software bugs.

Whether or not this is feasaible will depend on the specific schema and how it's used - you'd want to audit your own schema before assuming the same.

#### Verifying Extraction Queries

DMS paginates large tables using ordered keyset queries based on primary or composite indexes. Before starting the migration, we manually tested representative keyset queries against our largest tables to confirm they were index-supported and inexpensive.

On a burstable instance like t3.micro, this matters. A full table scan during extraction could exhaust CPU credits quickly. Our largest table had an appropriate composite index, and the extraction pattern was efficient.

If your schema is not index-aligned with your primary keys or ordering columns, fix that before starting.


## Perparing the Destination Database (Azure)

Several details must be configured before DMS writes to Azure.

#### Extensions

Check your RDS instance for any installed extensions:
```
SELECT *
FROM pg_available_extensions
WHERE installed_version IS NOT NULL;
```

And then enable the same ones in Azure. There are two steps: enable them under `azure.extensions` in the portal settings, then actually `CREATE EXTENSION` in the database. Both are required.

#### Users

Azure uses `adminuser` by default. Ensure the user being used on RDS exists in the destination user database.

#### SSL

Azure enforces SSL. Connection strings (if some reason they don't) must include:
```
sslmode=require
```

#### Networking

How DMS reaches both the source (RDS) and the target (Azure) depends on your network setup (opening access for specific IP addresses vs VPC peering), and this is worth designing around your constraints before you start the process.

For the **RDS side**: DMS runs inside a VPC. If your RDS instance is in the same VPC as DMS, no special networking is needed. If DMS and RDS are in *different* VPCs — which is common if you're using a dedicated DMS VPC — you need to set up VPC peering between them and update the route tables on both sides so traffic can flow. Without this, DMS simply can't reach the database.

For the **Azure side**: Azure Database for PostgreSQL doesn't live inside your AWS VPC, so DMS will reach it over the public internet. This means temporarily allowing DMS's public IP in the Azure firewall rules. You can find DMS's public IP on the instance details page after creating the replication instance. Once migration is complete, you can lock the firewall back down.

If your Azure database is configured for private access only (Azure Private Endpoint), you'd need an ExpressRoute or VPN connection from AWS to Azure to route traffic privately — a more involved setup we didn't need for this migration.

In our case, DMS was in the same VPC as RDS, so the source side was straightforward. We opened the Azure firewall to DMS's public IP for the duration of the migration.


## Running DMS: What We Tried First (Serverless)

DMS offers a serverless mode that auto-scales capacity units based on load. It sounded like the right call for our migration — we didn't want to over-provision for a one-time job.

In practice, serverless caused us enough friction that we abandoned it and moved to provisioned instances. The main issues:

- You can't test endpoints before starting a task (the test button is disabled for serverless)
- Diagnosing failures is harder because the error surfacing is slower
- Capacity scaling added unpredictability to an already complex operation

If your migration is simpler or your timeline is more flexible, serverless might work fine. For us, the faster feedback loop of provisioned instances was worth the extra setup.


## Running DMS: Provisioned

#### Naming Gotcha

Right off the bat our migrations were unsuccessful. We found that we had to be careful with the task name. Do not put "RDS" at the start of your task name. If you do, DMS will try to create a replication slot with an `rds_` prefix, which requires superuser permissions you don't have:

```
ERROR: could not create replication slot "rds_migration":
ERROR: must be superuser or replication role to use logical replication
slots in the 'rds' namespace
```

The error message is cryptic enough that it's not obvious what caused it. Name your task something else and you'll be fine.

#### Instance Sizing

We used a `dms.t3.large`. The allocated storage needs to be roughly 1.5–2x your expected database size to handle DMS buffering.

**Task settings:**
- Task Type: Migrate & Replicate (not just Migrate — you need ongoing replication)
- Target Table Preparation: Drop Tables on Target
- Stop task after full load: Do not stop
- LOB mode: Full LOB mode, max size 512
- Data Validation: On

#### Table creation

DMS will create the tables on the target, but it drops foreign keys, defaults, and unique constraints. This is documented but easy to underestimate. It means:

1. FK constraints won't be in place during the replication phase
2. Column defaults (like `DEFAULT CURRENT_TIMESTAMP`) won't exist
3. Indexes won't be created until after the initial load

This is fine for the migration itself — DMS can't reliably apply FK constraints when it's parallelizing rows across tables. But it means you have cleanup to do before you go live on the new database.


## Monitoring the Load

Once the task starts, watch a few things:

On the **DMS side**:

- the Table Statistics view shows per-table row counts. It's scrollable horizontally and has more detail than the progress percentage. Two new tables appear on the target: `awsdms_apply_exceptions` and `awsdms_validation_failures_v1`. Both should stay empty. If they don't, investigate immediately.

On the **RDS side**:

- Connection count, CPU, memory, and CPU credits. We saw spikes across the board during the initial load. Nothing hit a limit, but on a `t3.micro`, CPU credit depletion is a real concern. If you're burstable, scale up the instance before starting DMS. (Note: resizing RDS takes a few minutes of downtime — plan for that ahead of the replication setup.)


## Schema Cleanup

This is the part that's easy to under-plan. DMS leaves the target schema in a degraded state:

### Missing Defaults

Columns that had `DEFAULT CURRENT_TIMESTAMP`, `uuid_generate_v4()` or similar in the source don't have them in the target. If any application code passes `NULL` for those columns assuming the DB will fill them in, it will fail silently or with a constraint error. Audit these carefully.

### Missing Foreign Keys

Add them back explicitly. Run them in dependency order. If you have any orphaned rows (records that reference a parent that doesn't exist), the FK creation will fail.

### Missing Secondary Indexes

DMS creates primary key indexes but may not recreate all secondary indexes. Check the source schema against the target and add any that are missing.

For `user_activity` specifically, we had to restore:

```sql
CREATE INDEX idx_user_activity_company_date ON public.user_activity
  USING btree (company_id, date_created);
-- (plus several more indexes)

ALTER TABLE public.user_activity
  ADD CONSTRAINT fk_activity_company_id
  FOREIGN KEY (company_id) REFERENCES public.company(id);
-- (plus several more FK constraints)
```

And restore the timestamp default:

```sql
ALTER TABLE public.user_activity
  ALTER COLUMN date_created SET DEFAULT CURRENT_TIMESTAMP;
```


## Cutover

When the initial load is complete, DMS switches to continuous replication — it's catching up ongoing changes from the WAL. This is where you start preparing the cutover.

We used Azure deployment slots to test the new database before touching production. We pointed a staging slot at the Azure database with environment variables that would disable database writes at the application layer (`SCHEDULER_ENABLED=false` = no background jobs, no  write traffic) and throughly ran our test suites to verify all essential operations. This step is worth taking slowly.

### We'll Do It Live: The Cutover Procedure

#### 1. Application Changes

Ensure application supports write suspension.

Add `SCHEDULER_ENABLED=true` in production and implement logic such that when `SCHEDULER_ENABLED=false`, background jobs and scheduled writes are disabled.

#### 2. Confirm DMS is Caught Up

Confirm DMS is fully caught up

- Initial load complete
- Replication lag near zero
- No validation errors

At this point Azure is effectively a hot replica of RDS.

#### 3. Deploy staging slot pointed at Azure

- `SCHEDULER_ENABLED=false`
- New Azure DB connection string
- Production still pointing to RDS

Run test cases against staging, validate reads, validate limited writes (account settings of test accounts), confirm schema restoration (FKs, defaults, indexes) is correct.

This step proves Azure can function independently.

#### 4. Flip production to Azure

Update production environment variable:

- New DB host
- `SCHEDULER_ENABLED=true`

Redeploy production. Note taht we don't deployment slots in this case because the database connection string is a slot specific value (which allowed us to point staging and prod to different databases). So we need to update the value in the production slot itself.

At this point:

- Production writes go to Azure.
- DMS is still replicating from RDS, but RDS is no longer receiving writes.


#### 5. Stop DMS

Once confident no traffic is going to RDS:

- Stop replication task
- Monitor Azure for several days
- Keep RDS online temporarily for safety

Note that at this stage a rollback is no longer possible without temporary data loss as NEW writes are going to Azure.

## Architecture

Here's the process we went through

#### Phase 1: Migrate Data

<image src="{{ "/assets/images/db-cutover-migration-phase.png" | relative_url }}" alt="DB Cutover Migration Phase" />

#### Phase 2: Testing

<image src="{{ "/assets/images/db-cutover-testing-phase.png" | relative_url }}" alt="DB Cutover Testing Phase" />

#### Phase 3: Cutover

<image src="{{ "/assets/images/db-cutover-cutover-phase.png" | relative_url }}" alt="DB Cutover Cutover Phase" />



## What We'd Do Differently

**Start with provisioned DMS, not serverless.** The faster feedback loop on endpoint testing and failure diagnosis is worth it, especially when you're migrating a production system under time pressure.

**Script the schema cleanup SQL before migration day.** We knew DMS would drop FKs and defaults — we should have prepared and tested the restoration scripts in a staging environment before the cutover window.

**Plan for the East US / East US 2 region mismatch earlier.** We knew about it but deferred it. It means our app-to-database latency is slightly higher than it needs to be until we move the app servers. Not a crisis, but a loose end worth tracking.

**Budget time for the RDS parameter group restart — and do it first.** It's ~4 minutes of downtime. Treat it as its own maintenance event, completely separate from the migration. The migration itself adds no further downtime on top of this.


## What If We Needed True Zero Downtime?

Our migration required ~4 minutes of downtime for the initial RDS reboot to enable logical replication. Everything after that ran without interruption. We targeted a weekend (in all timezones to minimize impact)

We determined that we could afford this without negatively impacting our users. Eliminating even that 4-minute window would require significantly more engineering effort.

Possible approaches:

- Dual writes at the application layer: Application writes to both old and new databases during a transition period. Requires idempotency handling and reconciliation logic.
- Async writes: Using Kafka to buffer incoming writes, reducing downtime to READ queries only
- Proxy-based cutover (e.g., PgBouncer or connection router): Introduce a proxy layer capable of redirecting traffic mid-flight.
- Blue/green architecture with pre-enabled logical replication: More feasible on Aurora than standard RDS.

Each of these adds complexity:

- Application-level coordination
- Write conflict management
- Replay safety
- Additional operational risk

For us, the marginal benefit of reducing downtime from four minutes to zero did not justify the additional system complexity. A short, scheduled reboot was the more rational tradeoff. But as our platform matures, we may naturally fit the zero downtime migration path more cleanly, particuarly with respect to designing for async writes by default.

## Alternative Migration Strategies

Before reaching for DMS, it's worth asking whether you actually need it. We were migrating several databases during this project, and they took completely different paths because they had completely different constraints.

One of our databases contained no sensitive data, existed for infrequent recurring jobs and contained only ~500MB of data (compressed). For that database, we installed an audit trigger on the source database to log any writes, then ran a pg_dump and pg_restore during a quiet window.

After the import, we checked the audit log: if no writes had been recorded during the window, we cut over. If there had been writes, we'd have needed to replay them manually or re-run the dump. For us, the window was clean, so we cut over. This was only possible it was a non-critical workflow with minimal traffic. If that suits your use case better, the approach can be simpler than the one described in this document.

## Closing Thoughts

The DMS migration ran cleanly. Data validation in DMS showed no errors. We ran the new database in parallel for several days before fully cutting over, watching row counts and query behavior. Once we were confident, we disabled the DMS task and deprecated the RDS instance.

Total app downtime: ~4 minutes for the RDS parameter group restart, which we scheduled as a dedicated maintenance window before migration work began. The actual cutover — flipping production to Azure — added zero additional downtime.

The new database is measurably faster on read-heavy queries (more memory helps) and we're no longer watching CPU credit balances. Zone redundancy comes included. On balance, it's a clear improvement, and the migration path — while not simple — was well within reach for a small team.

<div class="next-chapter-section">
  <a href="/aws-azure-migration-guide/guides/chapter6-azure-dns-zones-setup/" class="next-chapter-button">
    <span class="button-content">
      <span class="button-text">Next Chapter</span>
      <span class="button-subtitle">Azure DNS Zones Setup</span>
      <span class="arrow">→</span>
    </span>
  </a>
</div>
