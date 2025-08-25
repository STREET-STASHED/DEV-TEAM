// Maintenance Alerting System for StreetStashed MVP
// Monitors maintenance job success/failure and sends alerts

import { createClient } from '@supabase/supabase-js';
import queries from '../database/queries';

const _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================
// ALERT TYPES
// =============================

export interface MaintenanceAlert {
  id: string;
  type: 'maintenance_failure' | 'database_health' | 'performance_degradation' | 'partition_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface AlertConfig {
  enabled: boolean;
  channels: ('email' | 'slack' | 'webhook')[];
  recipients?: string[];
  webhookUrl?: string;
  slackWebhookUrl?: string;
}

// =============================
// ALERT MONITORING
// =============================

export class MaintenanceAlertMonitor {
  private alertConfig: AlertConfig = {
    enabled: true,
    channels: ['webhook'],
    webhookUrl: process.env.ALERT_WEBHOOK_URL
  };

  /**
   * Check for maintenance job failures
   */
  async checkMaintenanceFailures(): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

    try {
      // Get recent maintenance logs
      const logs = await queries.maintenance.getLogs(100);
      
      // Check for failed jobs in the last 24 hours
      const recentFailures = logs.filter(log => 
        log.status === 'FAILED' && 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      if (recentFailures.length > 0) {
        alerts.push({
          id: `maintenance_failure_${Date.now()}`,
          type: 'maintenance_failure',
          severity: 'high',
          title: 'Maintenance Jobs Failed',
          message: `${recentFailures.length} maintenance job(s) failed in the last 24 hours`,
          details: {
            failures: recentFailures,
            totalJobs: logs.length,
            failureRate: (recentFailures.length / logs.length) * 100
          },
          timestamp: new Date(),
          resolved: false
        });
      }

      // Check for long-running jobs
      const longRunningJobs = logs.filter(log => {
        if (log.completed_at && log.started_at) {
          const duration = new Date(log.completed_at).getTime() - new Date(log.started_at).getTime();
          return duration > 5 * 60 * 1000; // 5 minutes
        }
        return false;
      });

      if (longRunningJobs.length > 0) {
        alerts.push({
          id: `long_running_jobs_${Date.now()}`,
          type: 'performance_degradation',
          severity: 'medium',
          title: 'Long-Running Maintenance Jobs',
          message: `${longRunningJobs.length} maintenance job(s) took longer than 5 minutes to complete`,
          details: {
            longRunningJobs,
            averageDuration: longRunningJobs.reduce((sum, job) => {
              const duration = new Date(job.completed_at!).getTime() - new Date(job.started_at!).getTime();
              return sum + duration;
            }, 0) / longRunningJobs.length
          },
          timestamp: new Date(),
          resolved: false
        });
      }

    } catch (error) {
      alerts.push({
        id: `monitoring_error_${Date.now()}`,
        type: 'maintenance_failure',
        severity: 'critical',
        title: 'Maintenance Monitoring Error',
        message: 'Failed to check maintenance job status',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth(): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

    try {
      // Check maintenance status
      const _maintenanceStatus = await queries.maintenance.getStatus();
      
      // Check partition statistics
      const partitionStats = await queries.maintenance.getPartitionStats();

      // Check for partition issues
      const emptyPartitions = partitionStats.filter(partition => partition.row_count === 0);
      const largePartitions = partitionStats.filter(partition => {
        const sizeInMB = parseInt(partition.table_size.replace(/[^\d]/g, ''));
        return sizeInMB > 1000; // 1GB
      });

      if (emptyPartitions.length > 0) {
        alerts.push({
          id: `empty_partitions_${Date.now()}`,
          type: 'partition_issue',
          severity: 'low',
          title: 'Empty Partitions Detected',
          message: `${emptyPartitions.length} partition(s) are empty`,
          details: {
            emptyPartitions,
            totalPartitions: partitionStats.length
          },
          timestamp: new Date(),
          resolved: false
        });
      }

      if (largePartitions.length > 0) {
        alerts.push({
          id: `large_partitions_${Date.now()}`,
          type: 'partition_issue',
          severity: 'medium',
          title: 'Large Partitions Detected',
          message: `${largePartitions.length} partition(s) are larger than 1GB`,
          details: {
            largePartitions,
            totalPartitions: partitionStats.length
          },
          timestamp: new Date(),
          resolved: false
        });
      }

    } catch (error) {
      alerts.push({
        id: `health_check_error_${Date.now()}`,
        type: 'database_health',
        severity: 'critical',
        title: 'Database Health Check Failed',
        message: 'Failed to perform database health check',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Check materialized view refresh status
   */
  async checkMaterializedViews(): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

    try {
      // Check if materialized views are stale (older than 24 hours)
      const maintenanceStatus = await queries.maintenance.getStatus();
      
      const staleViews = maintenanceStatus.filter(status => {
        if (status.maintenance_type === 'materialized_views' && status.last_run) {
          const lastRun = new Date(status.last_run);
          const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
          return hoursSinceLastRun > 24;
        }
        return false;
      });

      if (staleViews.length > 0) {
        alerts.push({
          id: `stale_views_${Date.now()}`,
          type: 'performance_degradation',
          severity: 'medium',
          title: 'Stale Materialized Views',
          message: 'Materialized views have not been refreshed in over 24 hours',
          details: {
            staleViews,
            hoursSinceLastRefresh: staleViews.map(view => {
              const lastRun = new Date(view.last_run);
              return (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
            })
          },
          timestamp: new Date(),
          resolved: false
        });
      }

    } catch (error) {
      alerts.push({
        id: `view_check_error_${Date.now()}`,
        type: 'performance_degradation',
        severity: 'high',
        title: 'Materialized View Check Failed',
        message: 'Failed to check materialized view status',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<MaintenanceAlert[]> {
    const [
      maintenanceAlerts,
      healthAlerts,
      viewAlerts
    ] = await Promise.all([
      this.checkMaintenanceFailures(),
      this.checkDatabaseHealth(),
      this.checkMaterializedViews()
    ]);

    return [...maintenanceAlerts, ...healthAlerts, ...viewAlerts];
  }

  /**
   * Send alerts through configured channels
   */
  async sendAlerts(alerts: MaintenanceAlert[]): Promise<void> {
    if (!this.alertConfig.enabled || alerts.length === 0) {
      return;
    }

    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  /**
   * Send a single alert
   */
  private async sendAlert(alert: MaintenanceAlert): Promise<void> {
    const alertPayload = {
      ...alert,
      timestamp: alert.timestamp.toISOString(),
      project: 'StreetStashed MVP',
      environment: process.env.NODE_ENV || 'development'
    };

    // Send to webhook
    if (this.alertConfig.channels.includes('webhook') && this.alertConfig.webhookUrl) {
      try {
        await fetch(this.alertConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload)
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }

    // Send to Slack
    if (this.alertConfig.channels.includes('slack') && this.alertConfig.slackWebhookUrl) {
      try {
        const slackMessage = {
          text: `🚨 *${alert.title}*\n${alert.message}\nSeverity: ${alert.severity.toUpperCase()}`,
          attachments: [{
            fields: [
              { title: 'Type', value: alert.type, short: true },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Details', value: JSON.stringify(alert.details, null, 2) }
            ]
          }]
        };

        await fetch(this.alertConfig.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage)
        });
      } catch (error) {
        console.error('Failed to send Slack alert:', error);
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Maintenance Alert]', alertPayload);
    }
  }

  /**
   * Configure alert settings
   */
  configureAlerts(config: AlertConfig): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }
}

// =============================
// AUTOMATED ALERTING
// =============================

export const maintenanceAlerts = {
  monitor: new MaintenanceAlertMonitor(),

  /**
   * Set up automated alert monitoring
   */
  setupMonitoring(intervalMinutes: number = 15) {
    setInterval(async () => {
      try {
        const alerts = await this.monitor.runHealthChecks();
        await this.monitor.sendAlerts(alerts);
      } catch (error) {
        console.error('[Alert Monitoring Error]', error);
      }
    }, intervalMinutes * 60 * 1000);
  },

  /**
   * Manually check for alerts
   */
  async checkAlerts(): Promise<MaintenanceAlert[]> {
    return await this.monitor.runHealthChecks();
  },

  /**
   * Configure alert settings
   */
  configure(config: AlertConfig): void {
    this.monitor.configureAlerts(config);
  }
};

// =============================
// ALERT RESOLUTION
// =============================

export const alertResolution = {
  /**
   * Mark an alert as resolved
   */
  async resolveAlert(alertId: string): Promise<void> {
    // In a real application, you would store this in a database
    console.log(`Alert ${alertId} marked as resolved`);
  },

  /**
   * Get unresolved alerts
   */
  async getUnresolvedAlerts(): Promise<MaintenanceAlert[]> {
    // In a real application, you would query from a database
    return [];
  }
};

// =============================
// ALERT DASHBOARD HELPERS
// =============================

export const alertDashboard = {
  /**
   * Get alert summary for dashboard
   */
  async getAlertSummary() {
    const alerts = await maintenanceAlerts.checkAlerts();
    
    const summary = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      byType: {
        maintenance_failure: alerts.filter(a => a.type === 'maintenance_failure').length,
        database_health: alerts.filter(a => a.type === 'database_health').length,
        performance_degradation: alerts.filter(a => a.type === 'performance_degradation').length,
        partition_issue: alerts.filter(a => a.type === 'partition_issue').length
      },
      recentAlerts: alerts.slice(0, 10) // Last 10 alerts
    };

    return summary;
  },

  /**
   * Get alert history
   */
  async getAlertHistory(_days: number = 7): Promise<MaintenanceAlert[]> {
    // In a real application, you would query from a database
    // For now, return empty array
    return [];
  }
};

// Initialize alert monitoring (check every 15 minutes)
maintenanceAlerts.setupMonitoring(15);
