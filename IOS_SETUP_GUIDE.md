# iOS Setup Guide - StreetStashed

## 🎯 Current Status

✅ Capacitor configuration updated  
✅ Web assets synced to iOS project  
✅ iOS ATS settings configured (HTTP allowed for dev)  
✅ Android cleartext traffic enabled  
✅ Ready for Xcode setup

## 📱 Setup Steps

### 1. Install Xcode (if not already installed)

```bash
# Download from App Store or https://developer.apple.com/xcode/
# Install Xcode (not just Command Line Tools)
```

### 2. Start Your Development Server

```bash
# Terminal 1: Start Next.js dev server
pnpm dev
# This runs on http://localhost:3000
```

### 3. Configure iOS Project

#### A. Open iOS Project in Xcode

```bash
# Terminal 2: Open iOS project
pnpm run native:open:ios
# Or manually: open ios/App/App.xcworkspace
```

#### B. Configure App Transport Security (ATS) for Debug

✅ **Already configured!** The iOS project has been updated with ATS settings to allow HTTP for development.

If you need to modify these settings in Xcode:

1. Select **Targets** → **App** → **Info**
2. Look for "App Transport Security Settings" in "Custom iOS Target Properties"

#### C. Configure Signing

1. Select **Targets** → **App** → **Signing & Capabilities**
2. Choose your **Team** (Apple ID)
3. Set **Bundle Identifier** to `com.streetstashed.app` (or unique variant)
4. For real device: plug in device and trust it

### 4. Run the App

#### Simulator (Recommended for testing)

1. In Xcode top bar, select an **iPhone Simulator** (e.g., "iPhone 15")
2. Press **▶️ Play** button
3. App should load from `http://localhost:3000`

#### Real Device

1. Connect your iPhone via USB
2. In Xcode top bar, select your **device**
3. Press **▶️ Play** button
4. Trust the developer certificate on your device

### 5. Troubleshooting

#### White Screen / Can't Load

- **Check**: Is `pnpm dev` running on port 3000?
- **Check**: Xcode Debug Console for network errors
- **Fix**: Ensure ATS settings are correct

#### Device Can't Reach localhost

For real device testing, use your Mac's LAN IP:

```bash
# Find your Mac's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example: if your Mac is 192.168.1.100
CAP_SERVER_URL=http://192.168.1.100:3000 pnpm run native:sync
```

#### Changes Not Reflected

After editing `capacitor.config.ts`:

```bash
pnpm run native:sync
```

## 🚀 Production Setup

### Option A: Hosted SSR (Recommended)

1. Deploy Next.js to Vercel/Render/etc.
2. Update `capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-domain.com',
  cleartext: false
}
```

3. Remove ATS "Allow Arbitrary Loads" for Release builds

### Option B: Static Export (if app supports it)

1. Build with `next export`
2. Update `capacitor.config.ts`:

```typescript
webDir: 'out',
// Remove server.url
```

## 📋 Configuration Files

### capacitor.config.ts (Current)

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.streetstashed.app",
  appName: "StreetStashed",
  webDir: ".next",
  server: {
    url: process.env.CAP_SERVER_URL ?? "http://localhost:3000",
    cleartext: true,
    allowNavigation: ["localhost", "192.168.0.0/16"],
  },
};

export default config;
```

### Info.plist (Add to Xcode)

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## 🎯 Next Steps

1. **Install Xcode** (if not done)
2. **Start dev server**: `pnpm dev`
3. **Open iOS project**: `pnpm run native:open:ios`
4. **Configure ATS** in Xcode Info.plist
5. **Set up signing** with your Apple ID
6. **Run on simulator** or device

## 🔧 Commands Reference

```bash
# Development
pnpm dev                    # Start Next.js server
pnpm run native:sync       # Sync config to native
pnpm run native:open:ios   # Open iOS project

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server
```

## 📞 Support

If you encounter issues:

1. Check Xcode Debug Console for errors
2. Ensure dev server is running
3. Verify ATS settings
4. Check network connectivity (for real device)

---

**Ready to run!** 🚀
