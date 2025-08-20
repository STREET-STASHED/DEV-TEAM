# 🚦 Cron Job Setup Guide for Driver System

Your driver system is now ready to run automatically! Here's how to set it up:

## ✅ What's Already Done

- ✅ Auto-assign orders API route (`/api/cron/auto-assign-orders`)
- ✅ Vercel cron configuration in `vercel.json`
- ✅ Driver scoring algorithm
- ✅ Order assignment logic
- ✅ Notification system
- ✅ Logging and monitoring

## 🔐 Step 1: Generate Cron Secret

Run this command to generate a secure secret:

```bash
./scripts/generate-cron-secret.sh
```

Or manually generate one:

```bash
openssl rand -base64 32
```

## 📝 Step 2: Create Environment File

Create a `.env.local` file in your project root:

```bash
# Cron Job Authentication
CRON_SECRET=your-generated-secret-here

# Replace with the actual secret you generated above
```

## 🚀 Step 3: Deploy to Vercel

1. Commit your changes:

```bash
git add .
git commit -m "Add cron job for auto-assigning orders"
git push
```

2. Deploy to Vercel (if using Vercel CLI):

```bash
vercel --prod
```

## ⏰ How It Works

- **Every 3 minutes**, Vercel will automatically call `/api/cron/auto-assign-orders`
- The system finds orders with status `ready_for_pickup`
- Available drivers are scored based on:
  - Rating (40% weight)
  - Completion rate (30% weight)
  - Recent activity (20% weight)
  - Location proximity (10% weight)
- Best drivers get assigned to orders
- Notifications are sent to drivers and buyers
- All activity is logged for monitoring

## 🧪 Testing

Test the endpoint manually:

```bash
curl -X POST "https://yourdomain.com/api/cron/auto-assign-orders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📊 Monitoring

Check the logs in your database:

```sql
SELECT * FROM cron_job_logs
WHERE job_name = 'auto_assign_orders'
ORDER BY executed_at DESC
LIMIT 10;
```

## 🔧 Troubleshooting

### Cron not running?

- Check Vercel deployment logs
- Verify `vercel.json` has cron configuration
- Ensure environment variable is set

### Orders not being assigned?

- Check if drivers are online and available
- Verify order status is `ready_for_pickup`
- Check database logs for errors

### Authentication errors?

- Verify `CRON_SECRET` is set correctly
- Check if the secret matches in your environment

## 🎯 Next Steps

1. **Monitor the first few runs** to ensure everything works
2. **Adjust the interval** if needed (currently 3 minutes)
3. **Set up alerts** for failed cron jobs
4. **Optimize driver scoring** based on real data

## 🚨 Important Notes

- **Keep your cron secret secure** - never commit it to version control
- **Monitor costs** - more frequent runs = more API calls
- **Test thoroughly** before going live
- **Backup your database** before enabling

Your driver system will now automatically assign orders every 3 minutes! 🎉
