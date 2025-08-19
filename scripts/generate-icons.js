#!/usr/bin/env node

/**
 * Icon and Splash Screen Generator for StreetStashed
 * Generates all required sizes for iOS and Android
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for iOS
const iOSIconSizes = [
  { size: 20, scale: 1, filename: 'AppIcon-20x20@1x.png' },
  { size: 20, scale: 2, filename: 'AppIcon-20x20@2x.png' },
  { size: 20, scale: 3, filename: 'AppIcon-20x20@3x.png' },
  { size: 29, scale: 1, filename: 'AppIcon-29x29@1x.png' },
  { size: 29, scale: 2, filename: 'AppIcon-29x29@2x.png' },
  { size: 29, scale: 3, filename: 'AppIcon-29x29@3x.png' },
  { size: 40, scale: 1, filename: 'AppIcon-40x40@1x.png' },
  { size: 40, scale: 2, filename: 'AppIcon-40x40@2x.png' },
  { size: 40, scale: 3, filename: 'AppIcon-40x40@3x.png' },
  { size: 60, scale: 2, filename: 'AppIcon-60x60@2x.png' },
  { size: 60, scale: 3, filename: 'AppIcon-60x60@3x.png' },
  { size: 76, scale: 1, filename: 'AppIcon-76x76@1x.png' },
  { size: 76, scale: 2, filename: 'AppIcon-76x76@2x.png' },
  { size: 83.5, scale: 2, filename: 'AppIcon-83.5x83.5@2x.png' },
  { size: 1024, scale: 1, filename: 'AppIcon-1024x1024@1x.png' }
];

// Icon sizes needed for Android
const androidIconSizes = [
  { size: 48, density: 'mdpi', filename: 'ic_launcher.png' },
  { size: 72, density: 'hdpi', filename: 'ic_launcher.png' },
  { size: 96, density: 'xhdpi', filename: 'ic_launcher.png' },
  { size: 144, density: 'xxhdpi', filename: 'ic_launcher.png' },
  { size: 192, density: 'xxxhdpi', filename: 'ic_launcher.png' }
];

// Splash screen sizes
const splashSizes = [
  { width: 320, height: 568, filename: 'splash-320x568.png' },
  { width: 375, height: 667, filename: 'splash-375x667.png' },
  { width: 414, height: 736, filename: 'splash-414x736.png' },
  { width: 768, height: 1024, filename: 'splash-768x1024.png' },
  { width: 1024, height: 1366, filename: 'splash-1024x1366.png' }
];

console.log('🎨 StreetStashed Icon & Splash Generator');
console.log('=====================================');

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = [
    'public/icons',
    'public/splash',
    'ios/App/App/Assets.xcassets/AppIcon.appiconset',
    'ios/App/App/Assets.xcassets/Splash.imageset',
    'android/app/src/main/res/mipmap-mdpi',
    'android/app/src/main/res/mipmap-hdpi',
    'android/app/src/main/res/mipmap-xhdpi',
    'android/app/src/main/res/mipmap-xxhdpi',
    'android/app/src/main/res/mipmap-xxxhdpi'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Generate iOS Contents.json
const generateiOSContents = () => {
  const contents = {
    images: iOSIconSizes.map(({ size, scale, filename }) => ({
      size: `${size}x${size}`,
      scale: `${scale}x`,
      filename: filename
    })),
    info: {
      version: 1,
      author: "StreetStashed"
    }
  };

  const iosIconPath = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json';
  fs.writeFileSync(iosIconPath, JSON.stringify(contents, null, 2));
  console.log(`✅ Generated iOS Contents.json`);

  // Generate Splash Contents.json
  const splashContents = {
    images: splashSizes.map(({ width, height, filename }) => ({
      filename: filename,
      idiom: "universal",
      scale: "1x",
      width: width,
      height: height
    })),
    info: {
      version: 1,
      author: "StreetStashed"
    }
  };

  const iosSplashPath = 'ios/App/App/Assets.xcassets/Splash.imageset/Contents.json';
  fs.writeFileSync(iosSplashPath, JSON.stringify(splashContents, null, 2));
  console.log(`✅ Generated iOS Splash Contents.json`);
};

// Generate Android adaptive icon
const generateAndroidAdaptiveIcon = () => {
  const adaptiveIcon = {
    foreground: {
      src: "@mipmap/ic_launcher_foreground"
    },
    background: {
      src: "@mipmap/ic_launcher_background"
    }
  };

  const adaptiveIconPath = 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml';
  if (!fs.existsSync('android/app/src/main/res/mipmap-anydpi-v26')) {
    fs.mkdirSync('android/app/src/main/res/mipmap-anydpi-v26', { recursive: true });
  }
  
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>`;
  
  fs.writeFileSync(adaptiveIconPath, xmlContent);
  console.log(`✅ Generated Android adaptive icon XML`);
};

// Generate PWA manifest icons
const generatePWAIcons = () => {
  const pwaIcons = [
    { size: 192, filename: 'icon-192x192.png' },
    { size: 512, filename: 'icon-512x512.png' },
    { size: 180, filename: 'apple-touch-icon.png' }
  ];

  pwaIcons.forEach(({ size, filename }) => {
    const filepath = `public/${filename}`;
    if (!fs.existsSync(filepath)) {
      // Create placeholder file
      fs.writeFileSync(filepath, `# Placeholder for ${size}x${size} icon`);
      console.log(`⚠️  Placeholder created: ${filepath} (replace with actual icon)`);
    }
  });
};

// Main execution
const main = () => {
  try {
    createDirectories();
    generateiOSContents();
    generateAndroidAdaptiveIcon();
    generatePWAIcons();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Create a 1024x1024 base icon with your logo');
    console.log('2. Run this script to generate all sizes');
    console.log('3. Replace placeholder files with actual icons');
    console.log('4. Test on devices');
    
    console.log('\n📱 App Store Requirements:');
    console.log('- iOS: 1024x1024 icon, various splash screens');
    console.log('- Android: 512x512 icon, adaptive icon support');
    console.log('- PWA: 192x192, 512x512, apple-touch-icon');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
