# 🚀 StreetStashed Viral Features Deployment Guide

## 📋 **Prerequisites**
- ✅ All feature flags are OFF (default state)
- ✅ Application builds and runs without errors
- ✅ Supabase project is accessible
- ✅ Database connection is working

## 🗄️ **Phase 1: Database Setup**

### **Step 1: Run Database Migration**

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your StreetStashed project
   - Navigate to **SQL Editor**

2. **Execute Migration Script**
   - Copy the contents of `scripts/deploy-viral-features.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Deployment**
   - Check the output shows all ✅ statuses
   - Navigate to **Database > Tables** to confirm new tables exist

### **Step 2: Verify Database Schema**

Expected tables created:
- ✅ `reviews` - User reviews and ratings
- ✅ `push_tokens` - Push notification tokens
- ✅ `analytics_events` - User analytics data
- ✅ `referral_leaderboard` - Materialized view for referrals

## 🎯 **Phase 2: Feature Rollout (One by One)**

### **Feature 1: Reviews & Ratings (Low Risk)**

#### **Enable Feature**
```bash
# Add to .env.local
ENABLE_REVIEWS=true
```

#### **Test Steps**
1. **Restart development server**
   ```bash
   pnpm dev
   ```

2. **Navigate to viral demo page**
   - Visit `/viral-demo`
   - Verify reviews section is visible
   - Check no console errors

3. **Test review submission**
   - Create a test order (if possible)
   - Submit a review through the form
   - Verify review appears in database

4. **Monitor for 24 hours**
   - Check application logs
   - Verify no performance degradation
   - Confirm user experience is smooth

#### **Rollback (if needed)**
```bash
# Disable reviews instantly
ENABLE_REVIEWS=false
```

---

### **Feature 2: Social Sharing (Low Risk)**

#### **Enable Feature**
```bash
# Add to .env.local
ENABLE_SHARE=true
```

#### **Test Steps**
1. **Restart development server**
2. **Check share buttons appear**
3. **Test deep link generation**
4. **Verify mobile app links work**

---

### **Feature 3: Referral Leaderboard (Low Risk)**

#### **Enable Feature**
```bash
# Add to .env.local
ENABLE_LEADERBOARD=true
```

#### **Test Steps**
1. **Restart development server**
2. **Visit `/referrals/leaderboard`**
3. **Verify data loads correctly**
4. **Test pagination and sorting**

---

### **Feature 4: Analytics (Low Risk)**

#### **Enable Feature**
```bash
# Add to .env.local
ENABLE_ANALYTICS=true
```

#### **Test Steps**
1. **Restart development server**
2. **Perform user actions**
3. **Check analytics events in database**
4. **Verify no performance impact**

---

### **Feature 5: Push Notifications (Medium Risk)**

#### **Enable Feature**
```bash
# Add to .env.local
ENABLE_PUSH=true
```

#### **Test Steps**
1. **Restart development server**
2. **Test token registration**
3. **Verify notification sending**
4. **Check error handling**

---

## 📊 **Monitoring & Safety**

### **Performance Metrics to Watch**
- API response times
- Database query performance
- Memory usage
- Error rates

### **User Experience Checks**
- No UI glitches
- Mobile responsiveness
- Authentication flows work
- No broken links

### **Instant Rollback Commands**
```bash
# Disable all features instantly
ENABLE_REVIEWS=false
ENABLE_SHARE=false
ENABLE_LEADERBOARD=false
ENABLE_ANALYTICS=false
ENABLE_PUSH=false
```

## 🚨 **Emergency Procedures**

### **If Something Goes Wrong**
1. **Immediately disable the feature**
   ```bash
   ENABLE_[FEATURE]=false
   ```

2. **Restart the application**
   ```bash
   pnpm dev
   ```

3. **Check logs for errors**
4. **Verify core functionality restored**
5. **Investigate issue before re-enabling**

### **Database Rollback**
If database changes cause issues:
1. **Drop problematic tables** (if needed)
2. **Restore from backup** (if available)
3. **Re-run migration** after fixing issues

## ✅ **Success Criteria**

### **Phase 1 Complete When**
- ✅ All database tables created successfully
- ✅ RLS policies working correctly
- ✅ Indexes created for performance
- ✅ Helper functions deployed

### **Phase 2 Complete When**
- ✅ All features enabled and tested
- ✅ No performance degradation
- ✅ User experience improved
- ✅ Analytics data flowing
- ✅ Push notifications working

## 🔄 **Next Steps After Deployment**

1. **Monitor production metrics**
2. **Gather user feedback**
3. **Optimize based on usage data**
4. **Plan next feature enhancements**

---

**Remember**: Take it slow, test thoroughly, and always have a rollback plan ready!
