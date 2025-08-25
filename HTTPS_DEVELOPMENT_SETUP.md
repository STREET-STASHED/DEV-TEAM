# HTTPS Development Setup for AR Try-On

## Why HTTPS is Needed

Safari and other browsers require HTTPS for camera access, even in development. This guide helps you set up HTTPS for local development.

## Quick Setup Options

### Option 1: Use Chrome or Firefox (Recommended for Testing)

- Chrome and Firefox allow camera access on `localhost` without HTTPS
- Simply use `http://localhost:3000` in Chrome or Firefox

### Option 2: Enable Demo Mode

- Click "Demo Mode" button in the AR Try-On interface
- Test all AR features without camera access
- Perfect for UI testing and demonstrations

### Option 3: Set up HTTPS with mkcert (Advanced)

1. **Install mkcert**:

   ```bash
   # macOS
   brew install mkcert
   mkcert -install

   # Windows
   choco install mkcert
   mkcert -install

   # Linux
   sudo apt install mkcert
   mkcert -install
   ```

2. **Generate certificates**:

   ```bash
   mkcert localhost 127.0.0.1 ::1
   ```

3. **Create custom HTTPS server**:

   ```javascript
   // server.js
   const { createServer } = require("https");
   const { parse } = require("url");
   const next = require("next");
   const fs = require("fs");
   const path = require("path");

   const dev = process.env.NODE_ENV !== "production";
   const hostname = "localhost";
   const port = 3000;

   const app = next({ dev, hostname, port });
   const handle = app.getRequestHandler();

   const httpsOptions = {
     key: fs.readFileSync(path.join(__dirname, "localhost+2-key.pem")),
     cert: fs.readFileSync(path.join(__dirname, "localhost+2.pem")),
   };

   app.prepare().then(() => {
     createServer(httpsOptions, async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true);
         await handle(req, res, parsedUrl);
       } catch (err) {
         console.error("Error occurred handling", req.url, err);
         res.statusCode = 500;
         res.end("internal server error");
       }
     }).listen(port, (err) => {
       if (err) throw err;
       console.log(`> Ready on https://${hostname}:${port}`);
       console.log("> HTTPS development server running");
       console.log("> Camera features should now work in Safari!");
     });
   });
   ```

4. **Start HTTPS development server**:

   ```bash
   pnpm run dev:https
   ```

5. **Access via HTTPS**:
   ```
   https://localhost:3000
   ```

## Browser Compatibility

| Browser | HTTP Support | HTTPS Required |
| ------- | ------------ | -------------- |
| Chrome  | ✅ localhost | ✅ All domains |
| Firefox | ✅ localhost | ✅ All domains |
| Safari  | ❌ None      | ✅ All domains |
| Edge    | ✅ localhost | ✅ All domains |

## Troubleshooting

### Camera Still Not Working?

1. Check browser permissions (allow camera access)
2. Ensure no other apps are using the camera
3. Try refreshing the page
4. Use demo mode for testing

### HTTPS Certificate Errors?

1. Make sure mkcert is installed and certificates are generated
2. Check that certificate files exist in project root
3. Restart the development server

### Demo Mode Not Working?

1. Click the "Demo Mode" button at the top of the AR Try-On page
2. All features should work without camera access
3. Perfect for testing the interface and user flows

## Quick Test

1. Visit: `http://localhost:3000/ar-tryon`
2. Click "Demo Mode" button
3. Test body scanning and product try-on
4. All features work without camera access!

This setup ensures you can test the AR Try-On feature regardless of your browser or HTTPS setup.
