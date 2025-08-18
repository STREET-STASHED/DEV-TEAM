# Black Screen Fix - iOS App

## 🚨 **Issue: Black Screen in iOS App**

### ✅ **What I Fixed:**

1. **Updated Capacitor config** to use your Mac's LAN IP: `10.0.0.210:3000`
2. **Updated iOS ATS settings** to allow your specific IP
3. **Synced changes** to iOS project

## 🔧 **Next Steps:**

### 1. Test Network Connectivity

```bash
# Test from Mac browser
curl http://10.0.0.210:3000

# Should return HTTP 200
```

### 2. Test from iOS Simulator Safari

1. **Open Safari in iOS Simulator**
2. Navigate to: `http://10.0.0.210:3000`
3. **If it loads**, your app should work
4. **If it doesn't load**, we need to troubleshoot further

### 3. Clean and Rebuild in Xcode

1. **Product** → **Clean Build Folder** (`Shift + ⌘ + K`)
2. **Product** → **Run** (`⌘ + R`)

## 🔍 **If Still Black Screen:**

### Check Xcode Console

1. **Window** → **Devices and Simulators**
2. Select your simulator
3. Click **"Open Console"**
4. Look for network errors or "Failed to resolve host"

### Alternative: Test with Simple URL

Temporarily change `capacitor.config.ts`:

```typescript
server: {
  url: 'http://example.com', // Test with simple site
  cleartext: true
}
```

If this works, the issue is with your dev server connectivity.

## 📱 **Current Configuration:**

### capacitor.config.ts

```typescript
server: {
  url: 'http://10.0.0.210:3000', // Your Mac's LAN IP
  cleartext: true,
  allowNavigation: ['localhost', '10.0.0.0/8', '192.168.0.0/16']
}
```

### iOS ATS Settings

- `NSAllowsArbitraryLoads: true`
- `NSAllowsArbitraryLoadsInWebContent: true`
- Specific exceptions for: `localhost`, `127.0.0.1`, `10.0.0.210`

## 🚀 **Expected Result:**

After these changes, your iOS app should load your Next.js development server and display your StreetStashed app instead of a black screen.

---

**Try the steps above and let me know if you still see a black screen!**
