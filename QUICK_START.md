# Quick Start - iOS Development

## 🚀 Fast Setup (Simulator)

### 1. Start Development

```bash
# Terminal 1: Start Next.js
pnpm dev

# Terminal 2: Open iOS project
pnpm run native:open:ios
```

### 2. In Xcode

1. **Select Simulator** (iPhone 15, etc.)
2. **ATS Settings** ✅ Already configured for HTTP
3. **Set Signing** (your Apple ID)
4. **Press ▶️ Play**

## 📱 Real Device Setup

### 1. Find Your Mac's IP

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example: 192.168.1.100
```

### 2. Update Capacitor Config

```bash
CAP_SERVER_URL=http://192.168.1.100:3000 pnpm run native:sync
```

### 3. In Xcode

1. **Connect iPhone** via USB
2. **Select Device** (not simulator)
3. **Trust Certificate** on device
4. **Press ▶️ Play**

## 🔧 Common Commands

```bash
# Development
pnpm dev                    # Start server
pnpm run native:sync       # Sync changes
pnpm run native:open:ios   # Open Xcode

# Production
pnpm build                 # Build app
pnpm start                 # Start production
```

## 🚨 Troubleshooting

### White Screen

- ✅ Is `pnpm dev` running?
- ✅ Check Xcode Debug Console
- ✅ ATS settings correct?

### Device Can't Connect

- ✅ Same WiFi network?
- ✅ Using LAN IP, not localhost?
- ✅ Firewall blocking port 3000?

### Changes Not Showing

```bash
pnpm run native:sync  # After editing capacitor.config.ts
```

---

**Need help?** Check `IOS_SETUP_GUIDE.md` for detailed steps.
