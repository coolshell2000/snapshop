#!/bin/bash

# Script to build SnapShop Android APK and install it on connected device

set -e  # Exit on any error

echo "==========================================="
echo "SnapShop Android Build & Deploy Automation"
echo "==========================================="

# Function to print status messages
print_status() {
    echo -e "\033[1;34m>>> $1\033[0m"
}

# Function to print success messages
print_success() {
    echo -e "\033[1;32m✓ $1\033[0m"
}

# Function to print error messages
print_error() {
    echo -e "\033[1;31m✗ $1\033[0m"
}

# Check if Android SDK tools are available
if ! command -v adb &> /dev/null; then
    print_error "ADB (Android Debug Bridge) not found. Please install Android SDK Platform Tools."
    exit 1
fi

# Check if Gradle is available
if ! command -v gradle &> /dev/null; then
    GRADLE_CMD="./gradlew"
    if [ ! -f "$GRADLE_CMD" ]; then
        print_error "Gradle not found and local gradlew script not found."
        exit 1
    fi
else
    GRADLE_CMD="gradle"
fi

print_status "Checking for connected Android devices..."
connected_devices=$(adb devices | grep -c "device$")
if [ "$connected_devices" -eq 0 ]; then
    print_error "No connected Android devices found. Please connect a device with USB debugging enabled."
    print_status "To enable USB debugging:"
    print_status "1. Go to Settings > About Phone > Tap Build Number 7 times to enable Developer Options"
    print_status "2. Go to Settings > Developer Options > Enable USB Debugging"
    print_status "3. Connect your device via USB and allow the connection on your phone"
    exit 1
else
    print_success "Found $connected_devices connected device(s)"
    adb devices
fi

print_status "Building Next.js application..."
cd /mnt/nvme0n1p1/home/bt/Project/ai/snapshop
npm run build

print_status "Syncing web assets to Android project..."
npx cap sync android

print_status "Setting up Android SDK location..."
cd android

# Check if local.properties exists, if not create it
if [ ! -f "local.properties" ]; then
    if [ -d "/mnt/nvme0n1p1/software/android_sdk" ]; then
        echo "sdk.dir=/mnt/nvme0n1p1/software/android_sdk" > local.properties
        print_success "Created local.properties with SDK location: /mnt/nvme0n1p1/software/android_sdk"
    elif [ -d "/usr/lib/android-sdk" ]; then
        echo "sdk.dir=/usr/lib/android-sdk" > local.properties
        print_success "Created local.properties with SDK location: /usr/lib/android-sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        echo "sdk.dir=$HOME/Android/Sdk" > local.properties
        print_success "Created local.properties with SDK location: $HOME/Android/Sdk"
    elif [ -n "$ANDROID_HOME" ]; then
        echo "sdk.dir=$ANDROID_HOME" > local.properties
        print_success "Created local.properties with SDK location from ANDROID_HOME: $ANDROID_HOME"
    else
        print_error "Could not find Android SDK. Please install Android SDK and set ANDROID_HOME or create local.properties with sdk.dir pointing to your SDK location."
        exit 1
    fi
else
    print_status "Using existing local.properties file"
fi

print_status "Building Android APK..."
chmod +x gradlew

# Attempt to build, but handle common errors
if ! $GRADLE_CMD assembleDebug --no-daemon; then
    print_error "Build failed. This may be due to missing Android SDK components or unaccepted licenses."
    print_status "If you see license errors, you may need to accept them manually:"
    print_status "1. Install Android SDK Command Line Tools"
    print_status "2. Run: yes | \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses"
    print_status "3. Then rerun this script"
    exit 1
fi

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
    print_error "APK build failed. $APK_PATH not found."
    exit 1
fi

print_success "APK built successfully: $APK_PATH"

# Get APK file size
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
print_status "APK size: $APK_SIZE"

# Copy APK to public folder for web download
print_status "Copying APK to public folder for web download..."
# When running from android directory, ../public refers to the project's public folder
PUBLIC_APK_PATH="../public/SnapShop.apk"
cp "$APK_PATH" "$PUBLIC_APK_PATH"

if [ $? -eq 0 ]; then
    print_success "APK copied to public folder: $PUBLIC_APK_PATH"
    # Get copied APK file size
    COPIED_APK_SIZE=$(du -h "$PUBLIC_APK_PATH" | cut -f1)
    print_status "Copied APK size: $COPIED_APK_SIZE"
else
    print_error "Failed to copy APK to public folder."
    exit 1
fi

print_status "Installing APK on connected device..."
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    print_success "APK installed successfully!"
    print_status "You can now open SnapShop on your device."
    
    # Optionally launch the app
    print_status "Attempting to launch the app on your device..."
    # This assumes the package name from capacitor.config.ts
    adb shell monkey -p com.example.snapshop -c android.intent.category.LAUNCHER 1
    
    echo ""
    print_success "Build and deployment completed successfully!"
    echo ""
    echo "To rebuild in the future, simply run this script again."
    echo "Make sure your Android device is connected with USB debugging enabled."
else
    print_error "Failed to install APK on device."
    exit 1
fi
