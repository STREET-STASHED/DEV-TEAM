export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@/app/lib/supabase/server';

export interface AuditEvent {
  event: string;
  user_id?: string;
  data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  event_type: string;
  user_id: string | null;
  event_data: any;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string | null;
  session_id: string | null;
  timestamp: string | null;
}

/**
 * Log an audit event to the database and console (in development)
 */
export async function audit(
  event: string, 
  data?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user info if available
    let userId: string | undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {
      // User not authenticated, continue without user_id
    }

    // Extract request metadata if available
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      // Get IP address from various headers
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 request.headers.get('cf-connecting-ip') ||
                 'unknown';
      
      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    // Sanitize sensitive data
    const safeData = sanitizeAuditData(data);

    // Create audit log entry
    const auditEntry = {
      event_type: event,
      user_id: userId || null,
      event_data: safeData as any,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      timestamp: new Date().toISOString()
    };

    // Insert into audit_log table
    try {
      const { error: insertError } = await supabase.from('analytics_events')
        .insert(auditEntry);

      if (insertError) {
        console.error('Failed to insert audit log:', insertError);
        // Fall back to console logging
      }
    } catch (error) {
      console.error('Error inserting audit log:', error);
      // Fall back to console logging
    }

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.info('[AUDIT]', {
        event,
        user_id: userId,
        data: safeData,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    // Ensure audit logging never breaks the main application
    console.error('Error in audit logging:', error);
    
    // Fallback console logging
    console.info('[AUDIT FALLBACK]', {
      event,
      data,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Sanitize audit data to remove sensitive information
 */
function sanitizeAuditData(data?: Record<string, unknown>): Record<string, unknown> | null {
  if (!data) return null;

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'api_key', 'private_key',
    'credit_card', 'card_number', 'cvv', 'ssn', 'social_security',
    'bank_account', 'routing_number', 'account_number'
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(filters: {
  event?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ 
  logs: AuditLogEntry[]; 
  total: number; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { logs: [], total: 0, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { logs: [], total: 0, error: 'Admin access required' };
    }

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.event) {
      query = query.eq('event', filters.event);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0, error: 'Failed to fetch audit logs' };
    }

    return { 
      logs: logs || [], 
      total: count || 0 
    };
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return { logs: [], total: 0, error: 'Internal server error' };
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 20
): Promise<{ 
  logs: AuditLogEntry[]; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { logs: [], error: 'Unauthorized' };
    }

    // Users can only see their own audit logs, admins can see any
    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwnLogs = user.id === userId;

    if (!isAdmin && !isOwnLogs) {
      return { logs: [], error: 'Insufficient permissions' };
    }

    const { data: logs, error } = await supabase.from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user audit logs:', error);
      return { logs: [], error: 'Failed to fetch audit logs' };
    }

    return { logs: logs || [] };
  } catch (error) {
    console.error('Error in getUserAuditLogs:', error);
    return { logs: [], error: 'Internal server error' };
  }
}

/**
 * Create audit log table if it doesn't exist
 * This is a utility function for database setup
 */
export async function ensureAuditTable(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check if audit_log table exists
    const { data: tables, error: tableError } = await (supabase.from as any)('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'audit_log');

    if (tableError) {
      console.error('Error checking audit_log table:', tableError);
      return { success: false, error: 'Failed to check table existence' };
    }

    if (tables && tables.length > 0) {
      return { success: true }; // Table already exists
    }

    // Create audit_log table
    const { error: createError } = await supabase.rpc('create_audit_log_table');
    
    if (createError) {
      console.error('Error creating audit_log table:', createError);
      return { success: false, error: 'Failed to create audit_log table' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in ensureAuditTable:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Export audit logs to CSV format
 */
export async function exportAuditLogsCSV(filters: {
  event?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
} = {}): Promise<{ 
  csv: string | null; 
  error?: string 
}> {
  try {
    const { logs, error } = await getAuditLogs({ ...filters, limit: 10000 });
    
    if (error) {
      return { csv: null, error };
    }

    if (!logs || logs.length === 0) {
      return { csv: 'No audit logs found' };
    }

    // Create CSV header
    const headers = ['Timestamp', 'Event', 'User ID', 'IP Address', 'User Agent', 'Data'];
    const csvRows = [headers.join(',')];

    // Add data rows
    for (const log of logs) {
      const row = [
        log.created_at,
        log.event_type,
        log.user_id || '',
        log.ip_address || '',
        (log.user_agent || '').replace(/"/g, '""'), // Escape quotes
        JSON.stringify(log.event_data || {}).replace(/"/g, '""') // Escape quotes
      ];
      csvRows.push(row.join(','));
    }

    return { csv: csvRows.join('\n') };
  } catch (error) {
    console.error('Error in exportAuditLogsCSV:', error);
    return { csv: null, error: 'Internal server error' };
  }
}

/**
 * Clean up old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<{ 
  deletedCount: number; 
  error?: string 
}> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { deletedCount: 0, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase.from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { deletedCount: 0, error: 'Admin access required' };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data, error } = await supabase.from('audit_log')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error cleaning up old audit logs:', error);
      return { deletedCount: 0, error: 'Failed to cleanup old logs' };
    }

    const deletedCount = data?.length || 0;

    // Log the cleanup operation
    await audit('audit_logs_cleanup', {
      deleted_count: deletedCount,
      retention_days: retentionDays,
      cutoff_date: cutoffDate.toISOString()
    });

    return { deletedCount };
  } catch (error) {
    console.error('Error in cleanupOldAuditLogs:', error);
    return { deletedCount: 0, error: 'Internal server error' };
  }
}
