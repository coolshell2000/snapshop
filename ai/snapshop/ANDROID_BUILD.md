SnapShop Android Build Automation

This project includes an automated script to build the SnapShop Android APK and deploy it to a connected device.

## Prerequisites

Before running the build script, ensure you have:

1. **Android SDK Platform Tools** installed (for ADB)
2. **Java Development Kit (JDK)** installed (required for Gradle)
3. **Connected Android device** with USB debugging enabled
4. **Node.js and npm** installed (already available in the project)

## Enabling USB Debugging on Your Android Device

1. Go to Settings > About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go to Settings > Developer Options
4. Enable "USB Debugging"
5. Connect your device via USB to your computer
6. On your phone, allow the connection when prompted

## Using the Build Script
remember that /mnt/nvme0n1p1/software/android_sdk is the full path for andriod sdk


Run the build script with the following command:

```bash
./build-android.sh
```

The script will:
1. Build the Next.js application
2. Sync web assets to the Android project
3. Build the Android APK
4. Install the APK on your connected device
5. Attempt to launch the app

## Manual Build Process

If you prefer to build manually, follow these steps:

```bash
# Navigate to project directory
cd /mnt/nvme0n1p1/home/bt/Project/ai/snapshop

# Build the Next.js application
npm run build

# Sync web assets to Android project
npx cap sync android

# Build the Android APK
cd android
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

- If the script reports "No connected Android devices found", ensure your device is connected with USB debugging enabled
- If you get permission errors, make sure the script is executable (`chmod +x build-android.sh`)
- If the build fails, check that you have sufficient disk space and all prerequisites installed
