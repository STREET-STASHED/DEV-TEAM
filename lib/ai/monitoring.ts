export const runtime = 'nodejs';

// 🤖 AI-Powered Production Monitoring System
// Tracks app health, detects issues, and provides intelligent insights

import { createRouteHandlerClient } from '@/app/lib/supabase/server'

interface MonitoringMetrics {
  timestamp: string
  endpoint: string
  responseTime: number
  statusCode: number
  errorRate: number
  userCount: number
  memoryUsage: number
  cpuUsage: number
}

interface AlertThresholds {
  responseTime: number // ms
  errorRate: number // percentage
  memoryUsage: number // MB
  cpuUsage: number // percentage
}

interface AIInsight {
  type: 'performance' | 'security' | 'user_experience' | 'scalability'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  recommendation: string
  confidence: number
}

class AIProductionMonitor {
  private metrics: MonitoringMetrics[] = []
  private alertThresholds: AlertThresholds
  private supabase: any
  private isMonitoring: boolean = false
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor() {
    this.alertThresholds = {
      responseTime: 2000, // 2 seconds
      errorRate: 5, // 5%
      memoryUsage: 1024, // 1GB
      cpuUsage: 80 // 80%
    }

    // Initialize Supabase for metrics storage
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Note: This will be initialized when methods are called
      this.supabase = null
    }
  }

  // 🚀 Start monitoring
  async startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🤖 AI Production Monitor: Started')
    
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
      await this.analyzeMetrics()
      await this.generateInsights()
    }, 30000)
  }

  // 🛑 Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    console.log('🤖 AI Production Monitor: Stopped')
  }

  // 📊 Collect real-time metrics
  private async collectMetrics() {
    try {
      const startTime = Date.now()
      
      // Test critical endpoints
      const endpoints = [
        '/',
        '/api/items',
        '/buyer/marketplace',
        '/buyer/checkout',
        '/signup'
      ]

      for (const endpoint of endpoints) {
        const response = await this.testEndpoint(endpoint)
        const responseTime = Date.now() - startTime
        
        this.metrics.push({
          timestamp: new Date().toISOString(),
          endpoint,
          responseTime,
          statusCode: response.status,
          errorRate: response.status >= 400 ? 1 : 0,
          userCount: await this.getActiveUserCount(),
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpuUsage: await this.getCPUUsage()
        })
      }

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000)
      }
    } catch (_error) {
      console.error('❌ Error collecting metrics:', _error)
    }
  }

  // 🧪 Test endpoint health
  private async testEndpoint(endpoint: string) {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'https://streetstashed.com'
        : 'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}${endpoint}`)
      return response
    } catch (_error) {
      return { status: 500 }
    }
  }

  // 👥 Get active user count
  private async getActiveUserCount(): Promise<number> {
    try {
      if (this.supabase) {
        const { count } = await this.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        return count || 0
      }
      return Math.floor(Math.random() * 100) + 10 // Mock data
    } catch {
      return 0
    }
  }

  // 💾 Get CPU usage
  private async getCPUUsage(): Promise<number> {
    // Mock CPU usage for now - in production, use system metrics
    return Math.floor(Math.random() * 30) + 20 // 20-50%
  }

  // 🧠 AI-powered metrics analysis
  private async analyzeMetrics() {
    if (this.metrics.length < 10) return

    const recentMetrics = this.metrics.slice(-50)
    
    // Calculate averages
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length

    // AI Pattern Detection
    this.detectPatterns(recentMetrics)
    
    // Generate alerts if thresholds exceeded
    if (avgResponseTime > this.alertThresholds.responseTime) {
      await this.createAlert('performance', 'high', 
        `Response time ${avgResponseTime.toFixed(0)}ms exceeds threshold of ${this.alertThresholds.responseTime}ms`,
        'Consider optimizing database queries or adding caching'
      )
    }

    if (avgErrorRate > this.alertThresholds.errorRate / 100) {
      await this.createAlert('security', 'critical',
        `Error rate ${(avgErrorRate * 100).toFixed(1)}% exceeds threshold of ${this.alertThresholds.errorRate}%`,
        'Investigate API errors and check server logs immediately'
      )
    }

    if (avgMemoryUsage > this.alertThresholds.memoryUsage) {
      await this.createAlert('scalability', 'medium',
        `Memory usage ${avgMemoryUsage.toFixed(0)}MB exceeds threshold of ${this.alertThresholds.memoryUsage}MB`,
        'Consider memory optimization or scaling up resources'
      )
    }

    // Store metrics in database
    await this.storeMetrics(recentMetrics)
  }

  // 🔍 AI Pattern Detection
  private detectPatterns(metrics: MonitoringMetrics[]) {
    const patterns = []

    // Detect response time degradation
    const responseTimes = metrics.map(m => m.responseTime)
    const trend = this.calculateTrend(responseTimes)
    
    if (trend > 0.1) { // 10% increase
      patterns.push({
        type: 'performance_degradation',
        confidence: Math.min(trend * 100, 95),
        message: 'Response times are trending upward'
      })
    }

    // Detect error spikes
    const errorRates = metrics.map(m => m.errorRate)
    const errorSpike = this.detectSpike(errorRates)
    
    if (errorSpike) {
      patterns.push({
        type: 'error_spike',
        confidence: 85,
        message: 'Error rate spike detected'
      })
    }

    return patterns
  }

  // 📈 Calculate trend (positive = increasing, negative = decreasing)
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, _val, _i) => sum + _val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + (val * i), 0)
    const sumX2 = values.reduce((sum, _val, i) => sum + (i * i), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope / (sumY / n) // Normalized slope
  }

  // 🚨 Detect spikes in data
  private detectSpike(values: number[]): boolean {
    if (values.length < 3) return false
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    )
    
    const latest = values[values.length - 1]
    return (latest - mean) > (2 * stdDev) // 2 standard deviations
  }

  // 💡 Generate AI insights
  private async generateInsights() {
    const insights: AIInsight[] = []

    // Performance insights
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length
    if (avgResponseTime > 1000) {
      insights.push({
        type: 'performance',
        severity: 'medium',
        message: 'Average response time is above optimal threshold',
        recommendation: 'Implement caching, optimize database queries, or consider CDN',
        confidence: 85
      })
    }

    // User experience insights
    const errorRate = this.metrics.reduce((sum, m) => sum + m.errorRate, 0) / this.metrics.length
    if (errorRate > 0.02) { // 2%
      insights.push({
        type: 'user_experience',
        severity: 'high',
        message: 'Error rate may be impacting user experience',
        recommendation: 'Review error logs, improve error handling, and add retry mechanisms',
        confidence: 90
      })
    }

    // Scalability insights
    const memoryTrend = this.calculateTrend(this.metrics.map(m => m.memoryUsage))
    if (memoryTrend > 0.05) { // 5% increase
      insights.push({
        type: 'scalability',
        severity: 'low',
        message: 'Memory usage is trending upward',
        recommendation: 'Monitor memory leaks, optimize data structures, or plan for scaling',
        confidence: 75
      })
    }

    // Store insights
    await this.storeInsights(insights)
  }

  // 🚨 Create and send alerts
  private async createAlert(type: string, severity: string, message: string, recommendation: string) {
    const alert = {
      id: Date.now().toString(),
      type,
      severity,
      message,
      recommendation,
      timestamp: new Date().toISOString(),
      acknowledged: false
    }

    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`)
    console.log(`💡 Recommendation: ${recommendation}`)

    // Store alert in database
    if (this.supabase) {
      try {
        await this.supabase
          .from('monitoring_alerts')
          .insert(alert)
      } catch (error) {
        console.error('Failed to store alert:', error)
      }
    }

    // Send notification (email, Slack, etc.)
    await this.sendNotification(alert)
  }

  // 📧 Send notifications
  private async sendNotification(alert: any) {
    // In production, integrate with your notification system
    // Slack, email, PagerDuty, etc.
    console.log(`📧 Sending ${alert.severity} alert notification...`)
  }

  // 💾 Store metrics in database
  private async storeMetrics(metrics: MonitoringMetrics[]) {
    try {
      const supabase = await createRouteHandlerClient()
      const formattedMetrics = metrics.map(metric => ({
        endpoint: metric.endpoint,
        response_time: metric.responseTime,
        status_code: metric.statusCode,
        error_rate: metric.errorRate,
        user_count: metric.userCount,
        memory_usage: metric.memoryUsage,
        cpu_usage: metric.cpuUsage,
        timestamp: metric.timestamp
      }))
      await supabase
        .from('monitoring_metrics')
        .insert(formattedMetrics)
    } catch (error) {
      console.error('Failed to store metrics:', error)
    }
  }

  // 💾 Store insights in database
  private async storeInsights(insights: AIInsight[]) {
    try {
      const supabase = await createRouteHandlerClient()
      await supabase
        .from('monitoring_insights')
        .insert(insights)
    } catch (error) {
      console.error('Failed to store insights:', error)
    }
  }

  // 📊 Get monitoring dashboard data
  async getDashboardData() {
    const recentMetrics = this.metrics.slice(-100)
    
    return {
      isMonitoring: this.isMonitoring,
      totalMetrics: this.metrics.length,
      recentMetrics,
      alerts: await this.getRecentAlerts(),
      insights: await this.getRecentInsights(),
      performance: {
        avgResponseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length,
        errorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length,
        uptime: this.calculateUptime()
      }
    }
  }

  // 🚨 Get recent alerts
  private async getRecentAlerts() {
    try {
      const supabase = await createRouteHandlerClient()
      const { data } = await supabase
        .from('monitoring_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)
      return data || []
    } catch {
      return []
    }
  }

  // 💡 Get recent insights
  private async getRecentInsights() {
    try {
      const supabase = await createRouteHandlerClient()
      const { data } = await supabase
        .from('monitoring_insights')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)
      return data || []
    } catch {
      return []
    }
  }

  // ⏱️ Calculate uptime
  private calculateUptime(): number {
    if (this.metrics.length < 2) return 100
    
    const totalChecks = this.metrics.length
    const successfulChecks = this.metrics.filter(m => m.statusCode < 400).length
    
    return (successfulChecks / totalChecks) * 100
  }
}

// Global instance
export const aiMonitor = new AIProductionMonitor()

// Export for use in other parts of the app
export default aiMonitor
