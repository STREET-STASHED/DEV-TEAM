# StreetStashed MVP - Complete Deployment Guide

## 🚀 Overview

This guide covers the complete deployment of the optimized database system, including maintenance jobs, query library integration, performance monitoring, and alerting systems.

## 📋 Prerequisites

- Supabase project with all migrations applied
- GitHub repository with access to secrets
- Environment variables configured
- Node.js application (Next.js recommended)

## 🔧 1. Deploy Maintenance Jobs

### Option A: Supabase Edge Functions (Recommended)

1. **Deploy Edge Functions**

   ```bash
   # Deploy maintenance functions
   supabase functions deploy maintenance
   supabase functions deploy maintenance/monthly
   ```

2. **Set Environment Variables**

   ```bash
   # Set service role key for maintenance functions
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Test Functions**

   ```bash
   # Test daily maintenance
   curl -X POST "https://your-project.supabase.co/functions/v1/maintenance" \
     -H "Authorization: Bearer your_anon_key"

   # Test monthly maintenance
   curl -X POST "https://your-project.supabase.co/functions/v1/maintenance/monthly" \
     -H "Authorization: Bearer your_anon_key"
   ```

### Option B: GitHub Actions

1. **Set Repository Secrets**
   - Go to your GitHub repository → Settings → Secrets
   - Add the following secrets:
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_PROJECT_REF`

2. **Enable GitHub Actions**
   - The workflow file is already created at `.github/workflows/maintenance.yml`
   - Actions will run automatically on schedule
   - You can also trigger manually from the Actions tab

### Option C: External Cron Service

1. **Set up cron jobs**

   ```bash
   # Daily at 2 AM UTC - Materialized view refresh
   0 2 * * * curl -X POST "https://your-project.supabase.co/functions/v1/maintenance" \
     -H "Authorization: Bearer your_anon_key" \
     -H "Content-Type: application/json"

   # Monthly on 1st at 3 AM UTC - Partition management
   0 3 1 * * curl -X POST "https://your-project.supabase.co/functions/v1/maintenance/monthly" \
     -H "Authorization: Bearer your_anon_key" \
     -H "Content-Type: application/json"
   ```

## 🔧 2. Integrate Query Library

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Set Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Import and Use Query Library

```typescript
// In your components/pages
import queries from '@/lib/database/queries';

// Example usage
export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Use optimized queries
        const dashboardData = await queries.dashboard.getData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      {/* Your dashboard UI */}
    </div>
  );
}
```

### Step 4: Performance Tracking (Optional)

```typescript
import { withPerformanceTracking } from "@/lib/monitoring/performance";

// Wrap queries with performance tracking
const trackedGetData = withPerformanceTracking(
  "dashboard_data",
  queries.dashboard.getData
);

// Use tracked function
const data = await trackedGetData();
```

## 🔧 3. Monitor Performance

### Step 1: Initialize Performance Monitoring

```typescript
// In your app initialization (e.g., _app.tsx or layout.tsx)
import { setupPerformanceMonitoring } from "@/lib/monitoring/performance";

// Setup monitoring (runs automatically in development)
setupPerformanceMonitoring();
```

### Step 2: Create Performance Dashboard

```typescript
// pages/admin/performance.tsx
import { performanceMonitoring } from '@/lib/monitoring/performance';

export default function PerformanceDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    async function loadReport() {
      const performanceReport = await performanceMonitoring.getPerformanceReport();
      setReport(performanceReport);
    }

    loadReport();
    // Refresh every 5 minutes
    const interval = setInterval(loadReport, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Performance Dashboard</h1>
      {report && (
        <div>
          <h2>Summary</h2>
          <p>Overall Health: {report.summary.overallHealth}</p>
          <p>Average Query Time: {report.summary.averageQueryTime}ms</p>
          <p>Success Rate: {report.summary.successRate}%</p>

          <h2>Benchmarks</h2>
          {report.benchmarks.map(benchmark => (
            <div key={benchmark.name}>
              <p>{benchmark.name}: {benchmark.executionTime}ms</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Monitor Database Health

```typescript
// Regular health checks
import { performanceMonitoring } from "@/lib/monitoring/performance";

// Check database health
const health = await performanceMonitoring.checkDatabaseHealth();
console.log("Database Health:", health);
```

## 🔧 4. Set Up Alerts

### Step 1: Configure Alert Channels

```typescript
// In your app initialization
import { maintenanceAlerts } from "@/lib/alerts/maintenance-alerts";

// Configure alerts
maintenanceAlerts.configure({
  enabled: true,
  channels: ["webhook", "slack"],
  webhookUrl: process.env.ALERT_WEBHOOK_URL,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
});
```

### Step 2: Set Environment Variables

```env
# .env.local
ALERT_WEBHOOK_URL=https://your-webhook-service.com/alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
```

### Step 3: Create Alert Dashboard

```typescript
// pages/admin/alerts.tsx
import { alertDashboard } from '@/lib/alerts/maintenance-alerts';

export default function AlertDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadAlerts() {
      const alertSummary = await alertDashboard.getAlertSummary();
      setSummary(alertSummary);
    }

    loadAlerts();
    // Refresh every minute
    const interval = setInterval(loadAlerts, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Alert Dashboard</h1>
      {summary && (
        <div>
          <h2>Summary</h2>
          <p>Total Alerts: {summary.total}</p>

          <h3>By Severity</h3>
          <p>Critical: {summary.bySeverity.critical}</p>
          <p>High: {summary.bySeverity.high}</p>
          <p>Medium: {summary.bySeverity.medium}</p>
          <p>Low: {summary.bySeverity.low}</p>

          <h3>Recent Alerts</h3>
          {summary.recentAlerts.map(alert => (
            <div key={alert.id} style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '5px 0',
              backgroundColor: alert.severity === 'critical' ? '#ffebee' : '#fff'
            }}>
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
              <p>Severity: {alert.severity}</p>
              <p>Time: {alert.timestamp.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔧 5. Application Integration Examples

### Dashboard Component

```typescript
// components/Dashboard.tsx
import { useState, useEffect } from 'react';
import queries from '@/lib/database/queries';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const dashboardData = await queries.dashboard.getData();
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>StreetStashed Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{data.marketplace.total_users}</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{data.marketplace.total_orders}</p>
        </div>

        <div className="stat-card">
          <h3>Active Orders</h3>
          <p>{data.activeOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Available Stashers</h3>
          <p>{data.availableStashers}</p>
        </div>
      </div>

      <div className="top-products">
        <h2>Top Products</h2>
        {data.topProducts.map(product => (
          <div key={product.product_id} className="product-item">
            <h4>{product.product_name}</h4>
            <p>Revenue: ${product.total_revenue}</p>
            <p>Orders: {product.times_ordered}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### User Profile Component

```typescript
// components/UserProfile.tsx
import { useState, useEffect } from 'react';
import queries from '@/lib/database/queries';

export default function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const data = await queries.dashboard.getUserData(userId);
      setUserData(data);
    }

    loadUserData();
  }, [userId]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      <div className="user-stats">
        <h3>Statistics</h3>
        <p>Total Orders: {userData.stats.total_orders}</p>
        <p>Completed Orders: {userData.stats.completed_orders}</p>
        <p>Total Spent: ${userData.stats.total_spent}</p>
        <p>Member Since: {new Date(userData.stats.member_since).toLocaleDateString()}</p>
      </div>

      <div className="user-engagement">
        <h3>Engagement</h3>
        <p>Level: {userData.engagement.engagement_level}</p>
        <p>Social Posts: {userData.engagement.social_posts}</p>
        <p>Social Interactions: {userData.engagement.social_interactions}</p>
      </div>

      <div className="user-activity">
        <h3>Current Activity</h3>
        <p>Pending Orders: {userData.pendingOrders}</p>
        <p>Unread Notifications: {userData.unreadNotifications}</p>
      </div>
    </div>
  );
}
```

## 🔧 6. Testing and Validation

### Test Maintenance Jobs

```bash
# Test daily maintenance manually
curl -X POST "https://your-project.supabase.co/functions/v1/maintenance" \
  -H "Authorization: Bearer your_anon_key"

# Check maintenance logs
supabase db reset --debug | grep "maintenance"
```

### Test Query Performance

```typescript
// Test query performance
import { performanceMonitoring } from "@/lib/monitoring/performance";

const report = await performanceMonitoring.getPerformanceReport();
console.log("Performance Report:", report);
```

### Test Alerts

```typescript
// Test alert system
import { maintenanceAlerts } from "@/lib/alerts/maintenance-alerts";

const alerts = await maintenanceAlerts.checkAlerts();
console.log("Current Alerts:", alerts);
```

## 🔧 7. Production Checklist

- [ ] All migrations applied successfully
- [ ] Edge functions deployed and tested
- [ ] Environment variables configured
- [ ] Query library integrated into application
- [ ] Performance monitoring active
- [ ] Alert system configured and tested
- [ ] GitHub Actions workflow enabled (if using)
- [ ] Database health checks passing
- [ ] Materialized views refreshing properly
- [ ] Partition management working
- [ ] Alert notifications being sent
- [ ] Performance benchmarks within acceptable ranges

## 🔧 8. Monitoring and Maintenance

### Daily Tasks

- Check maintenance job logs
- Review performance metrics
- Monitor alert notifications

### Weekly Tasks

- Review slow queries
- Check partition growth
- Analyze performance trends

### Monthly Tasks

- Review and optimize indexes
- Clean up old maintenance logs
- Update partition management

## 🆘 Troubleshooting

### Common Issues

1. **Maintenance Jobs Failing**
   - Check Supabase function logs
   - Verify service role key permissions
   - Check database connectivity

2. **Slow Query Performance**
   - Review query execution plans
   - Check index usage
   - Monitor materialized view refresh times

3. **Alert Notifications Not Working**
   - Verify webhook URLs
   - Check environment variables
   - Test alert channels manually

4. **Partition Issues**
   - Check partition creation logs
   - Verify date ranges
   - Monitor partition sizes

### Support

For issues with the deployment:

1. Check the maintenance logs first
2. Review the troubleshooting section
3. Test components individually
4. Contact the development team with specific error messages

---

_This deployment guide ensures your StreetStashed MVP database runs optimally with automated maintenance, comprehensive monitoring, and proactive alerting._
