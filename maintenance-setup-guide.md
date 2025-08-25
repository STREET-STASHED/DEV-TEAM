# StreetStashed MVP - Maintenance Setup Guide

## 🚀 Automated Maintenance System

This guide covers the setup and management of automated maintenance jobs for the StreetStashed MVP database.

## 📋 Overview

The maintenance system includes:

- **Daily Materialized View Refresh** - Keeps analytics data current
- **Monthly Partition Management** - Creates new partitions and cleans old ones
- **Comprehensive Logging** - Tracks all maintenance activities
- **Error Handling** - Graceful failure recovery
- **Performance Monitoring** - Tracks execution times and success rates

## 🔧 Setup Instructions

### 1. Database Functions Available

The following functions are now available in your database:

#### Maintenance Functions

```sql
-- Refresh all materialized views with error handling
SELECT * FROM public.refresh_materialized_views_safe();

-- Manage partitions automatically (create new, drop old)
SELECT * FROM public.manage_partitions_automatically();

-- Get maintenance status
SELECT * FROM public.get_maintenance_status();

-- Run daily maintenance job (includes logging)
SELECT public.daily_maintenance_job();

-- Run monthly maintenance job (includes logging)
SELECT public.monthly_maintenance_job();
```

#### Monitoring Functions

```sql
-- Get partition statistics
SELECT * FROM public.get_partition_statistics();

-- Monitor partition usage
SELECT * FROM public.partition_usage_monitor;

-- View maintenance logs
SELECT * FROM public.maintenance_logs ORDER BY created_at DESC;
```

### 2. Setting Up Automated Jobs

#### Option A: Using Supabase Edge Functions (Recommended)

Create a new Edge Function for maintenance:

```typescript
// supabase/functions/maintenance/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabaseClient.rpc("daily_maintenance_job");

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

#### Option B: Using External Cron Service

Set up a cron job to call the maintenance functions:

```bash
# Daily at 2 AM - Refresh materialized views
0 2 * * * curl -X POST "https://your-project.supabase.co/functions/v1/maintenance" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Monthly on 1st at 3 AM - Partition management
0 3 1 * * curl -X POST "https://your-project.supabase.co/functions/v1/maintenance/monthly" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Option C: Using GitHub Actions

Create `.github/workflows/maintenance.yml`:

```yaml
name: Database Maintenance

on:
  schedule:
    # Daily at 2 AM UTC
    - cron: "0 2 * * *"
  workflow_dispatch:

jobs:
  daily-maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Run Daily Maintenance
        run: |
          curl -X POST "https://your-project.supabase.co/functions/v1/maintenance" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"

  monthly-maintenance:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 3 1 * *'
    steps:
      - name: Run Monthly Maintenance
        run: |
          curl -X POST "https://your-project.supabase.co/functions/v1/maintenance/monthly" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### 3. Monitoring Setup

#### Dashboard Queries

Use these queries in your admin dashboard:

```typescript
// Get maintenance status
const maintenanceStatus = await supabase.rpc("get_maintenance_status");

// Get recent maintenance logs
const logs = await supabase
  .from("maintenance_logs")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(50);

// Get partition statistics
const partitionStats = await supabase.rpc("get_partition_statistics");
```

#### Alerting Setup

Set up alerts for maintenance failures:

```typescript
// Check for failed maintenance jobs
const failedJobs = await supabase
  .from("maintenance_logs")
  .select("*")
  .eq("status", "FAILED")
  .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

if (failedJobs.data.length > 0) {
  // Send alert notification
  await sendAlert("Maintenance jobs failed", failedJobs.data);
}
```

## 📊 Performance Monitoring

### Materialized View Performance

Monitor refresh times and success rates:

```sql
-- Check materialized view refresh performance
SELECT
  maintenance_type,
  COUNT(*) as total_runs,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful_runs,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
  MAX(created_at) as last_run
FROM public.maintenance_logs
WHERE maintenance_type LIKE 'view_refresh_%'
GROUP BY maintenance_type
ORDER BY last_run DESC;
```

### Partition Performance

Monitor partition usage and growth:

```sql
-- Check partition sizes and row counts
SELECT * FROM public.get_partition_statistics();

-- Monitor partition growth over time
SELECT
  partition_month,
  COUNT(*) as partitions,
  SUM(row_count) as total_rows
FROM public.get_partition_statistics()
GROUP BY partition_month
ORDER BY partition_month;
```

## 🔍 Troubleshooting

### Common Issues

1. **Materialized View Refresh Fails**

   ```sql
   -- Check for specific view errors
   SELECT * FROM public.maintenance_logs
   WHERE maintenance_type LIKE 'view_refresh_%'
   AND status = 'FAILED'
   ORDER BY created_at DESC;
   ```

2. **Partition Creation Fails**

   ```sql
   -- Check partition management errors
   SELECT * FROM public.maintenance_logs
   WHERE maintenance_type LIKE 'partition_%'
   AND status = 'FAILED'
   ORDER BY created_at DESC;
   ```

3. **Performance Issues**
   ```sql
   -- Check for long-running maintenance jobs
   SELECT
     maintenance_type,
     EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds
   FROM public.maintenance_logs
   WHERE status = 'COMPLETED'
   ORDER BY duration_seconds DESC;
   ```

### Manual Recovery

If automated jobs fail, you can run maintenance manually:

```sql
-- Manual materialized view refresh
SELECT public.refresh_all_materialized_views();

-- Manual partition management
SELECT public.manage_partitions_automatically();

-- Check maintenance status
SELECT * FROM public.get_maintenance_status();
```

## 📈 Optimization Tips

### 1. Schedule Optimization

- **Materialized Views**: Refresh daily during low-traffic hours (2-4 AM)
- **Partitions**: Create monthly on the 1st of each month
- **Monitoring**: Check logs weekly for any issues

### 2. Performance Tuning

- Monitor refresh times and adjust schedules if needed
- Consider refreshing high-priority views more frequently
- Use `CONCURRENTLY` refresh to avoid blocking reads

### 3. Storage Management

- Monitor partition sizes and consider archiving old data
- Set up alerts for partition growth
- Regularly review and clean up old maintenance logs

## 🔐 Security Considerations

### Access Control

- Maintenance functions require authenticated access
- Use service role key for automated jobs
- Log all maintenance activities for audit trails

### Data Protection

- Maintenance jobs don't modify user data
- All operations are logged with timestamps
- Failed operations are captured with error details

## 📞 Support

If you encounter issues with the maintenance system:

1. Check the maintenance logs first
2. Review the troubleshooting section above
3. Test manual execution of maintenance functions
4. Contact the development team with specific error messages

## 🎯 Next Steps

1. **Deploy the maintenance system** using one of the setup options above
2. **Monitor the first few runs** to ensure everything works correctly
3. **Set up alerts** for maintenance failures
4. **Review performance** and adjust schedules as needed
5. **Document any customizations** for your specific use case

---

_This maintenance system is designed to keep your StreetStashed MVP database running optimally with minimal manual intervention._
