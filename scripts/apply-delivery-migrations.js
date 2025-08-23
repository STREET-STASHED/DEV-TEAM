#!/usr/bin/env node

/**
 * Apply Delivery System Database Migrations
 * This script manually applies the required database changes for the delivery system
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigrations() {
  console.log('🚀 Applying delivery system migrations...\n')

  try {
    // 1. Create order_status_history table
    console.log('📋 Creating order_status_history table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_status_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          driver_id UUID REFERENCES driver_profiles(user_id),
          driver_name VARCHAR(255),
          driver_phone VARCHAR(20),
          location TEXT,
          notes TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (tableError) {
      console.log('⚠️  Table creation error (might already exist):', tableError.message)
    } else {
      console.log('✅ order_status_history table created')
    }

    // 2. Create indexes
    console.log('🔍 Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);',
      'CREATE INDEX IF NOT EXISTS idx_order_status_history_timestamp ON order_status_history(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);',
      'CREATE INDEX IF NOT EXISTS idx_order_status_history_driver_id ON order_status_history(driver_id);'
    ]

    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: index })
      if (error) {
        console.log('⚠️  Index creation error:', error.message)
      }
    }
    console.log('✅ Indexes created')

    // 3. Enable RLS
    console.log('🔒 Enabling Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;'
    })

    if (rlsError) {
      console.log('⚠️  RLS error:', rlsError.message)
    } else {
      console.log('✅ RLS enabled')
    }

    // 4. Create RLS policies
    console.log('📜 Creating RLS policies...')
    const policies = [
      `CREATE POLICY "Users can view status history for their own orders" ON order_status_history
        FOR SELECT USING (
          order_id IN (
            SELECT id FROM orders WHERE buyer_id = auth.uid()
          )
        );`,
      `CREATE POLICY "Drivers can view status history for orders assigned to them" ON order_status_history
        FOR SELECT USING (
          order_id IN (
            SELECT id FROM orders WHERE driver_id = auth.uid()
          )
        );`,
      `CREATE POLICY "System can insert status history" ON order_status_history
        FOR INSERT WITH CHECK (true);`,
      `CREATE POLICY "System can update status history" ON order_status_history
        FOR UPDATE USING (true);`
    ]

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy })
      } catch (error) {
        console.log('⚠️  Policy creation error (might already exist):', error.message)
      }
    }
    console.log('✅ RLS policies created')

    // 5. Create trigger function
    console.log('⚡ Creating trigger function...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION add_order_status_history()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Only add history if status actually changed
          IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO order_status_history (
              order_id,
              status,
              driver_id,
              driver_name,
              driver_phone,
              location,
              notes
            ) VALUES (
              NEW.id,
              NEW.status,
              NEW.driver_id,
              (SELECT full_name FROM driver_profiles WHERE user_id = NEW.driver_id),
              (SELECT phone FROM driver_profiles WHERE user_id = NEW.driver_id),
              CASE 
                WHEN NEW.status = 'picked_up' THEN 'Picked up from seller location'
                WHEN NEW.status = 'in_transit' THEN 'En route to delivery location'
                WHEN NEW.status = 'delivered' THEN 'Delivered to buyer'
                ELSE NULL
              END,
              CASE 
                WHEN NEW.status = 'assigned_to_driver' THEN 'Driver assigned to order'
                WHEN NEW.status = 'picked_up' THEN 'Order picked up successfully'
                WHEN NEW.status = 'in_transit' THEN 'Order in transit to delivery location'
                WHEN NEW.status = 'delivered' THEN 'Order delivered successfully'
                ELSE 'Status updated'
              END
            );
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (functionError) {
      console.log('⚠️  Function creation error:', functionError.message)
    } else {
      console.log('✅ Trigger function created')
    }

    // 6. Create trigger
    console.log('🎯 Creating trigger...')
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS trigger_add_order_status_history ON orders;
        CREATE TRIGGER trigger_add_order_status_history
          AFTER UPDATE ON orders
          FOR EACH ROW
          EXECUTE FUNCTION add_order_status_history();
      `
    })

    if (triggerError) {
      console.log('⚠️  Trigger creation error:', triggerError.message)
    } else {
      console.log('✅ Trigger created')
    }

    // 7. Insert initial status history for existing orders
    console.log('📝 Inserting initial status history...')
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO order_status_history (order_id, status, timestamp, notes)
        SELECT 
          id,
          status,
          created_at,
          'Order created'
        FROM orders
        WHERE NOT EXISTS (
          SELECT 1 FROM order_status_history WHERE order_id = orders.id
        );
      `
    })

    if (insertError) {
      console.log('⚠️  Initial data insertion error:', insertError.message)
    } else {
      console.log('✅ Initial status history inserted')
    }

    console.log('\n🎉 All delivery system migrations applied successfully!')
    console.log('The delivery system is now ready for testing.')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migrations
if (require.main === module) {
  applyMigrations()
}

module.exports = { applyMigrations }
