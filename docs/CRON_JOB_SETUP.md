# 🚀 StreetStashed Cron Job Setup Guide

## Overview
This guide will help you set up the automated order assignment system that runs every few minutes to automatically match orders with available drivers.

## 🎯 What the Cron Job Does

The cron job automatically:
- ✅ Finds orders ready for pickup
- ✅ Identifies available drivers
- ✅ Assigns orders using smart matching algorithm
- ✅ Sends notifications to drivers and buyers
- ✅ Updates order status and driver availability
- ✅ Logs all activities for monitoring

## 🔧 Setup Options

### Option 1: Vercel Cron (Recommended for Vercel Deployments)

If you're deploying on Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-assign-orders",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

**Schedule Explanation:**
- `*/3 * * * *` = Every 3 minutes
- `*/5 * * * *` = Every 5 minutes (more conservative)
- `*/2 * * * *` = Every 2 minutes (more aggressive)

### Option 2: GitHub Actions (Free & Reliable)

Create `.github/workflows/cron-assign-orders.yml`:

```yaml
name: Auto-Assign Orders

on:
  schedule:
    # Runs every 3 minutes
    - cron: '*/3 * * * *'
  workflow_dispatch: # Allows manual triggering

jobs:
  assign-orders:
    runs-on: ubuntu-latest
    
    steps:
    - name: Trigger Order Assignment
      run: |
        curl -X POST "${{ secrets.APP_URL }}/api/cron/auto-assign-orders" \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          -H "Content-Type: application/json"
      
      env:
        APP_URL: ${{ secrets.APP_URL }}
        CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

**Required Secrets:**
- `APP_URL`: Your app's base URL (e.g., `https://your-app.vercel.app`)
- `CRON_SECRET`: The secret key for authentication

### Option 3: External Cron Service (Cron-job.org)

1. Go to [cron-job.org](https://cron-job.org)
2. Create account and add new cron job
3. Set URL: `https://your-app.vercel.app/api/cron/auto-assign-orders`
4. Set schedule: Every 3 minutes
5. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 4: Server Cron (For Self-Hosted)

```bash
# Add to crontab (crontab -e)
*/3 * * * * curl -X POST "https://your-app.com/api/cron/auto-assign-orders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## 🔐 Environment Variables

Add these to your `.env.local`:

```bash
# Cron job authentication
CRON_SECRET=your-super-secret-key-here

# App URL (for cron job calls)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Generate a secure CRON_SECRET:**
```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Use online generator
# https://generate-secret.vercel.app/32
```

## 🧪 Testing the Cron Job

### 1. Manual Test
```bash
curl -X POST "https://your-app.vercel.app/api/cron/auto-assign-orders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### 2. Check Response
You should see:
```json
{
  "success": true,
  "message": "Cron job completed successfully",
  "assigned_count": 0,
  "total_ready_orders": 0,
  "available_drivers": 0,
  "remaining_drivers": 0,
  "assignments": [],
  "timestamp": "2025-01-20T..."
}
```

### 3. Check Database
```sql
-- Check if cron job is logging
SELECT * FROM cron_job_logs ORDER BY executed_at DESC LIMIT 5;

-- Check driver profiles
SELECT * FROM driver_profiles;

-- Check orders status
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

## 📊 Monitoring & Health Checks

### 1. Cron Job Logs
The system automatically logs every execution:
- Success/failure status
- Orders processed and assigned
- Drivers available
- Execution time
- Error details (if any)

### 2. Health Check Endpoint
```bash
GET /api/cron/auto-assign-orders
```
Returns current system status without executing assignments.

### 3. Database Monitoring
```sql
-- Recent cron job performance
SELECT 
  job_name,
  COUNT(*) as total_runs,
  AVG(orders_assigned) as avg_orders_per_run,
  MAX(executed_at) as last_run
FROM cron_job_logs 
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY job_name;

-- System health metrics
SELECT 
  COUNT(*) FILTER (WHERE status = 'ready_for_pickup') as orders_waiting,
  COUNT(*) FILTER (WHERE status = 'assigned_to_driver') as orders_assigned,
  COUNT(*) FILTER (WHERE status = 'in_transit') as orders_in_transit
FROM orders;
```

## ⚠️ Troubleshooting

### Common Issues:

#### 1. "Unauthorized" Error
- Check `CRON_SECRET` environment variable
- Verify Authorization header format: `Bearer YOUR_SECRET`

#### 2. Cron Job Not Running
- Verify schedule syntax
- Check service status (GitHub Actions, Vercel, etc.)
- Test manual execution first

#### 3. No Orders Being Assigned
- Check if orders exist with status `ready_for_pickup`
- Verify drivers are online and available
- Check database permissions and RLS policies

#### 4. Performance Issues
- Increase cron interval (5-10 minutes instead of 2-3)
- Monitor database query performance
- Check server logs for timeouts

### Debug Commands:
```bash
# Check environment variables
echo $CRON_SECRET

# Test endpoint manually
curl -v "https://your-app.com/api/cron/auto-assign-orders" \
  -H "Authorization: Bearer YOUR_SECRET"

# Check server logs
# Look for cron job execution logs
```

## 🚀 Production Recommendations

### 1. Cron Frequency
- **Development**: Every 5-10 minutes
- **Production**: Every 2-3 minutes
- **High Volume**: Every 1-2 minutes

### 2. Monitoring
- Set up alerts for failed cron jobs
- Monitor order assignment success rate
- Track driver availability patterns

### 3. Scaling
- Consider multiple cron jobs for different regions
- Implement queue system for high-volume scenarios
- Add retry logic for failed assignments

## 📈 Performance Optimization

### 1. Database Indexes
All necessary indexes are created automatically by the migration.

### 2. Query Optimization
The system uses efficient queries with proper joins and filters.

### 3. Batch Processing
Orders are processed in batches to optimize performance.

## 🎉 Success Indicators

Your cron job is working correctly when you see:
- ✅ Regular entries in `cron_job_logs` table
- ✅ Orders moving from `ready_for_pickup` to `assigned_to_driver`
- ✅ Drivers receiving notifications
- ✅ Buyers getting driver assignment updates
- ✅ Consistent success rates above 95%

## 🔄 Next Steps

1. **Deploy the database migrations** using `supabase/deploy-driver-system.sql`
2. **Set up the cron job** using one of the options above
3. **Test the system** with sample orders and drivers
4. **Monitor performance** and adjust frequency as needed
5. **Scale up** based on your marketplace volume

---

**Need Help?** Check the logs, test manually, and verify your environment variables. The system is designed to be robust and self-healing! 🚀
