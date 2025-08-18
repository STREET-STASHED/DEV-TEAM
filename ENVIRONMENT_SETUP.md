# 🌍 StreetStashed Environment Configuration Guide

This guide shows you how to set up all the environment variables needed for the production-ready StreetStashed system.

## 📁 Create Environment File

Create a `.env.local` file in your project root:

```bash
touch .env.local
```

## 🔑 Required Environment Variables

### Supabase Configuration

```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase anonymous key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (private, server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe Configuration

```bash
# Your Stripe publishable key (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...

# Your Stripe secret key (private, server-side only)
STRIPE_SECRET_KEY=sk_test_51ABC123...

# Your Stripe webhook secret
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

### Google Maps Configuration

```bash
# Your Google Maps API key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyABC123...
```

### Application Configuration

```bash
# Your frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Your WebSocket URL
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3000
```

### Security Configuration

```bash
# JWT secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Encryption key for sensitive data
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Database Configuration

```bash
# Database connection string (if using external DB)
DATABASE_URL=postgresql://username:password@host:port/database
```

### Email Configuration (Optional)

```bash
# SMTP settings for email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Storage Configuration (Optional)

```bash
# File storage bucket
STORAGE_BUCKET=your-storage-bucket-name
STORAGE_REGION=us-east-1
```

### Analytics Configuration (Optional)

```bash
# Google Analytics tracking ID
NEXT_PUBLIC_GA_TRACKING_ID=G-ABC123...

# Mixpanel token
NEXT_PUBLIC_MIXPANEL_TOKEN=abc123...
```

### Feature Flags

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_GOOGLE_MAPS=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

## 🚀 Quick Setup Commands

### 1. Copy the template:

```bash
cp ENVIRONMENT_SETUP.md .env.local
```

### 2. Edit the file:

```bash
nano .env.local
# or
code .env.local
```

### 3. Replace placeholder values with your actual API keys

## 🔐 Getting Your API Keys

### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the URL and keys

### Stripe

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Go to Developers → API keys
4. Copy the publishable and secret keys

### Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Maps JavaScript API
4. Create credentials → API key

## ⚠️ Security Notes

- **Never commit** `.env.local` to version control
- **Keep private keys** secure and server-side only
- **Rotate keys** regularly in production
- **Use different keys** for development and production

## 🧪 Testing Your Configuration

After setting up your environment variables:

1. **Restart your development server:**

   ```bash
   pnpm dev
   ```

2. **Visit the integration test page:**

   ```
   http://localhost:3000/test-integration
   ```

3. **Check that all features are working:**
   - Google Maps loading
   - WebSocket connections
   - GPS tracking
   - Stripe payment forms

## 🚀 Production Deployment

For production deployment, set these environment variables in your hosting platform:

- **Vercel**: Use the Environment Variables section in your project settings
- **Netlify**: Use the Environment Variables section in your site settings
- **AWS**: Use AWS Systems Manager Parameter Store or Secrets Manager
- **Docker**: Use environment files or Docker secrets

## 🔍 Troubleshooting

### Common Issues:

1. **"API key not found"** - Check that your environment variable names match exactly
2. **"Permission denied"** - Ensure your API keys have the correct permissions
3. **"CORS errors"** - Verify your frontend URL is correct
4. **"WebSocket connection failed"** - Check your WebSocket URL configuration

### Debug Mode:

```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG_MODE=true
```

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure your API keys are valid and active
4. Check your hosting platform's environment variable documentation

---

**🎉 You're now ready to run StreetStashed with all production features enabled!**
