# 🧪 StreetStashed Quick Testing Guide

## 🚀 **Phase 1: Basic User Flow (5 minutes)**

### **1. Landing Page Test**
- [ ] Open `http://localhost:3000`
- [ ] Verify black & gold theme
- [ ] Click "Shop Now" → Should go to marketplace
- [ ] Click "Start Selling" → Should redirect to signup (✅ This is correct!)

### **2. User Registration Test**
- [ ] Click "Create Account" or go to `/signup`
- [ ] Fill out signup form
- [ ] Verify form validation works
- [ ] Complete registration

### **3. Onboarding Test**
- [ ] After signup, should see onboarding flow
- [ ] Enter measurements (height, weight, etc.)
- [ ] Select style preferences
- [ ] Complete onboarding

## 🛍️ **Phase 2: Buyer Experience (10 minutes)**

### **4. Marketplace Test**
- [ ] Go to `/buyer/marketplace`
- [ ] Browse products (should see mock data)
- [ ] Test filters (category, price, size)
- [ ] Click on a product

### **5. Product Details Test**
- [ ] View product images
- [ ] Check product information
- [ ] Select size/quantity
- [ ] Add to cart

### **6. Cart & Checkout Test**
- [ ] Go to cart (should see added items)
- [ ] Modify quantities
- [ ] Proceed to checkout
- [ ] Fill shipping address
- [ ] Select payment method
- [ ] Complete order

## 🏪 **Phase 3: Seller Experience (10 minutes)**

### **7. Seller Setup Test**
- [ ] Sign up with new email as seller
- [ ] Complete seller profile
- [ ] Verify seller dashboard loads

### **8. Product Upload Test**
- [ ] Go to `/seller/upload`
- [ ] Fill product form
- [ ] Upload images
- [ ] Set pricing
- [ ] Publish product

### **9. Inventory Management Test**
- [ ] Check seller dashboard
- [ ] View published products
- [ ] Edit product details
- [ ] Check analytics

## 🚚 **Phase 4: Driver (Stasher) Experience (10 minutes)**

### **10. Driver Setup Test**
- [ ] Sign up with new email as driver
- [ ] Complete driver profile
- [ ] Verify driver dashboard loads

### **11. Order Management Test**
- [ ] Check for available orders
- [ ] Accept an order
- [ ] Simulate pickup process
- [ ] Simulate delivery

## 🎯 **Phase 5: Advanced Features (15 minutes)**

### **12. AI Recommendations Test**
- [ ] Browse marketplace
- [ ] Check if personalized recommendations appear
- [ ] Verify recommendation quality

### **13. AR Try-On Test**
- [ ] Go to product with AR feature
- [ ] Test virtual try-on
- [ ] Verify measurements integration

### **14. Social Features Test**
- [ ] Check social feed
- [ ] Test challenges
- [ ] Verify gamification elements

## 🔍 **What to Look For:**

### **✅ Success Indicators:**
- All forms submit without errors
- Navigation works smoothly
- Data persists between page loads
- Responsive design on mobile
- Loading states work properly

### **⚠️ Potential Issues:**
- Form validation errors
- Navigation broken links
- Data not saving
- Mobile responsiveness issues
- Performance problems

## 🚨 **If Something Breaks:**

1. **Check browser console** for JavaScript errors
2. **Check terminal** for server errors
3. **Verify database connection** (Supabase)
4. **Check environment variables** are set
5. **Restart dev server** if needed

## 📱 **Test on Multiple Devices:**
- Desktop browser
- Mobile browser
- Different screen sizes
- Different browsers (Chrome, Firefox, Safari)

## 🎯 **Expected Results:**
- **Core flows should work 100%**
- **Authentication should be secure**
- **Data should persist properly**
- **UI should be responsive**
- **Performance should be smooth**

---

**Time Estimate: 50 minutes for full testing**
**Priority: Test core flows first, then advanced features**
