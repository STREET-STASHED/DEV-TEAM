# iOS Troubleshooting Guide

## 🚨 **Current Status: Ready to Test**

✅ Dev server running on `http://localhost:3000` (HTTP 200)  
✅ iOS ATS settings updated with specific domain exceptions  
✅ Capacitor config synced  
✅ Ready for Xcode testing

## 🔧 **Fix 1: Silence Pods Warning**

### In Xcode:

1. **Project** → **TARGETS** → **App** → **Build Phases**
2. Expand **[CP] Embed Pods Frameworks**
3. **Uncheck** "Based on dependency analysis"
4. Do the same for **[CP] Copy Pods Resources** if present

## 🌐 **Fix 2: Network Connectivity Issues**

### Step 1: Test Dev Server

```bash
# Verify server is running
curl http://localhost:3000
# Should return HTTP 200
```

### Step 2: Test from iOS Simulator

1. **Open Safari in iOS Simulator**
2. Navigate to `http://localhost:3000`
3. **If it doesn't load**, use your Mac's LAN IP instead

### Step 3: Find Your Mac's LAN IP

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.100 netmask 0xffffff00
```

### Step 4: Update Capacitor Config (if needed)

If localhost doesn't work in simulator, update `capacitor.config.ts`:

```typescript
server: {
  url: 'http://192.168.1.100:3000', // Replace with your IP
  cleartext: true
}
```

Then sync:

```bash
pnpm run native:sync
```

## 📱 **Fix 3: Xcode Build Issues**

### User Script Sandboxing (if you see sandbox errors)

1. **Project** → **TARGETS** → **App** → **Build Settings**
2. Search: `User Script Sandboxing`
3. Set **"Enable User Script Sandboxing"** to **No**
4. **Product** → **Clean Build Folder** (`Shift + ⌘ + K`)

### Clean Build Process

1. **Product** → **Clean Build Folder** (`Shift + ⌘ + K`)
2. **Product** → **Run** (`⌘ + R`)

## 🚀 **Testing Checklist**

### Before Running in Xcode:

- [ ] Dev server running (`pnpm dev`)
- [ ] Server accessible from Mac browser (`http://localhost:3000`)
- [ ] Server accessible from iOS Simulator Safari
- [ ] Capacitor config synced (`pnpm run native:sync`)
- [ ] Xcode project opened (`ios/App.xcworkspace`)

### In Xcode:

- [ ] User Script Sandboxing disabled (if needed)
- [ ] Pods warning silenced (uncheck "Based on dependency analysis")
- [ ] Clean build folder
- [ ] Run app

## 🔍 **Debug Network Issues**

### Check Console Logs

1. **Xcode** → **Window** → **Devices and Simulators**
2. Select your device/simulator
3. Click **"Open Console"**
4. Filter for your app name
5. Look for network errors or watchdog kills

### Test with Simple URL

Temporarily change `capacitor.config.ts`:

```typescript
server: {
  url: 'http://example.com', // Test with simple site
  cleartext: true
}
```

If this works, the issue is with your dev server connectivity.

## 📋 **Common Error Solutions**

### "Failed to resolve host network app id / signal 9"

- **Cause**: WKWebView can't reach your dev server
- **Fix**: Ensure server is running and accessible from simulator

### "Sandbox: bash(...) deny(1) file-read-data"

- **Cause**: User Script Sandboxing blocking CocoaPods
- **Fix**: Disable User Script Sandboxing in Build Settings

### "Command SwiftCompile failed with a nonzero exit code" / "double-quoted include in framework header"

- **Cause**: Capacitor/Cordova header include style conflicts
- **Fix**: Reinstall CocoaPods dependencies
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
pnpm run native:sync
```

### White screen in app

- **Cause**: Network connectivity or ATS blocking
- **Fix**: Check ATS settings and server accessibility

## 🎯 **Quick Test Commands**

```bash
# Test dev server
curl http://localhost:3000

# Find Mac IP (for device testing)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Sync changes
pnpm run native:sync

# Open iOS project
pnpm run native:open:ios
```

## 🚀 **Next Steps**

1. **Open Xcode**: `pnpm run native:open:ios`
2. **Silence Pods warning** (Build Phases)
3. **Clean and Run** (`Shift + ⌘ + K`, then `⌘ + R`)
4. **Test in Simulator Safari** first: `http://localhost:3000`

---

**Need help?** Check Xcode Console for specific error messages!
