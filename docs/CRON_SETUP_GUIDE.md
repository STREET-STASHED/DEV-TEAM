# 🚦 Cron Job Setup Guide for Driver System

Your driver system is now ready to run automatically! Here's how to set it up:

## ✅ What's Already Done

- ✅ Auto-assign orders API route (`/api/cron/auto-assign-orders`)
- ✅ Vercel cron configuration in `vercel.json` (daily at 9 AM)
- ✅ GitHub Actions workflow (every 3 minutes) - **RECOMMENDED**
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

## ⚙️ Step 4: Set Up GitHub Actions (RECOMMENDED)

Since Vercel Hobby plan only allows daily cron jobs, we've set up GitHub Actions to run every 3 minutes for free:

1. **Go to your GitHub repository**
2. **Click Settings → Secrets and variables → Actions**
3. **Add these repository secrets:**
   - `CRON_URL`: `https://yourdomain.com/api/cron/auto-assign-orders`
   - `CRON_SECRET`: `your-generated-secret-here`

4. **The workflow will automatically start running every 3 minutes**

## ⏰ How It Works

### Option 1: Vercel Cron (Daily at 9 AM)

- **Once per day at 9 AM**, Vercel calls your API
- Good for daily maintenance tasks

### Option 2: GitHub Actions (Every 3 Minutes) - **RECOMMENDED**

- **Every 3 minutes**, GitHub Actions calls your API
- Completely free and unlimited
- Perfect for real-time order assignment

The system finds orders with status `ready_for_pickup`, scores available drivers, and assigns the best matches automatically.

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
- **For GitHub Actions**: Check Actions tab in your repo

### Orders not being assigned?

- Check if drivers are online and available
- Verify order status is `ready_for_pickup`
- Check database logs for errors

### Authentication errors?

- Verify `CRON_SECRET` is set correctly
- Check if the secret matches in your environment

## 🎯 Next Steps

1. **Set up GitHub Actions secrets** for 3-minute intervals
2. **Monitor the first few runs** to ensure everything works
3. **Set up alerts** for failed cron jobs
4. **Optimize driver scoring** based on real data

## 🚨 Important Notes

- **Keep your cron secret secure** - never commit it to version control
- **GitHub Actions is free** and runs every 3 minutes
- **Vercel cron is daily** (Hobby plan limitation)
- **Test thoroughly** before going live
- **Backup your database** before enabling

Your driver system will now automatically assign orders every 3 minutes via GitHub Actions! 🎉
