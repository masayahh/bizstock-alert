# Assets Directory

This directory contains app icons and splash screens for the BizStock Alert app.

## Required Files

For the app to build properly, you need to add the following files:

- **icon.png** - App icon (1024x1024 px)
- **adaptive-icon.png** - Android adaptive icon (1024x1024 px)
- **splash.png** - Splash screen (1284x2778 px)
- **favicon.png** - Web favicon (48x48 px)

## Using Default Expo Icons

If you don't have custom icons yet, you can use Expo's default icons by running:

```bash
npx expo prebuild --clean
```

This will generate default placeholder icons automatically.

## Creating Custom Icons

You can create custom icons using:
- Figma
- Adobe Illustrator
- Online tools like https://www.appicon.co/

### Design Guidelines

**Icon (icon.png)**
- Size: 1024x1024 px
- Format: PNG with transparency
- Design: Simple, recognizable logo
- Colors: Match app theme (Calm Black)

**Adaptive Icon (adaptive-icon.png)**
- Size: 1024x1024 px
- Safe zone: 66% of total area (central 660x660 px)
- Background: #000000 (black)

**Splash Screen (splash.png)**
- Size: 1284x2778 px (iPhone 14 Pro Max)
- Background: #000000 (black)
- Content: Centered logo or app name

**Favicon (favicon.png)**
- Size: 48x48 px
- Format: PNG
- Simple icon that works at small size

## Temporary Solution

For development and testing, you can create simple placeholder images:

1. Create a black square with white text "BS" (BizStock)
2. Export at required sizes
3. Place in this directory

The app will work without these files in Expo Go, but they're required for production builds.
