package com.example.snapshop;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.res.TypedArray;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int PERMISSION_REQUEST_CODE = 100;
    private boolean doubleBackToExitPressedOnce = false;
    private Handler mHandler = new Handler();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Apply top margin to prevent status bar overlap
        // Using a delayed approach to ensure the view is properly initialized
        getWindow().getDecorView().post(() -> applyTopSpacing());

        // Request necessary permissions
        requestPermissions();

        // Initialize auto-update check
        checkForUpdates();
    }

    private void applyTopSpacing() {
        // Calculate the actual status bar height dynamically
        int statusBarHeight = getStatusBarHeight();
        int actionBarHeight = getActionBarHeight();

        // Calculate total top spacing needed (status bar + action bar + extra padding)
        int totalTopSpacing = statusBarHeight + actionBarHeight + dpToPx(16); // Extra 16dp padding

        // Apply the calculated spacing to the WebView, but only after bridge is initialized
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setPadding(0, totalTopSpacing, 0, 0);
        }

        // Also apply to the coordinator layout for redundancy
        View coordinatorLayout = findViewById(R.id.coordinator_layout);
        if (coordinatorLayout != null) {
            coordinatorLayout.setPadding(0, totalTopSpacing, 0, 0);
        }

        // For newer Android versions, use WindowInsets for more reliable status bar handling
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            getWindow().getInsetsController().setSystemBarsBehavior(
                WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }

    private int getActionBarHeight() {
        int actionBarHeight = 0;
        TypedValue tv = new TypedValue();
        if (getTheme().resolveAttribute(android.R.attr.actionBarSize, tv, true)) {
            actionBarHeight = getResources().getDimensionPixelSize(tv.resourceId);
        }
        return actionBarHeight;
    }

    private int getStatusBarHeight() {
        int result = 0;
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round((float) dp * density);
    }

    private void requestPermissions() {
        // Check and request storage permission for downloading APK
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
            != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                new String[]{
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.REQUEST_INSTALL_PACKAGES  // For installing APK
                },
                PERMISSION_REQUEST_CODE);
        }
    }

    private void checkForUpdates() {
        // Use the domain from the Capacitor configuration or a default
        String serverUrl = getServerUrl();
        Log.d(TAG, "Checking for updates from: " + serverUrl);

        // Create update helper and check for updates
        AppUpdateHelper updateHelper = new AppUpdateHelper(this);
        updateHelper.checkForUpdates(serverUrl);
    }

    private String getServerUrl() {
        // Try to get the server URL from Capacitor config
        try {
            // Default to the domain where the app was initially loaded from
            String serverUrl = getBridge().getServerUrl();
            if (serverUrl != null && !serverUrl.isEmpty()) {
                // If the server URL contains localhost, replace it with cs2000.linkpc.net:3000
                if (serverUrl.contains("localhost") || serverUrl.contains("127.0.0.1") || serverUrl.contains("10.") || serverUrl.contains("192.168.")) {
                    serverUrl = serverUrl.replace("localhost", "cs2000.linkpc.net:3000")
                                         .replace("127.0.0.1", "cs2000.linkpc.net:3000")
                                         .replaceFirst("https?://[^/]+", "http://cs2000.linkpc.net:3000");
                }

                // Ensure the URL ends with a slash to form proper paths for update files
                if (!serverUrl.endsWith("/")) {
                    serverUrl += "/";
                }
                Log.d(TAG, "Using URL for updates: " + serverUrl);
                return serverUrl; // Use root path (no public folder)
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not get server URL from bridge: " + e.getMessage());
        }

        // Fallback to cs2000.linkpc.net:3000 root URL with HTTP (no public folder)
        String fallbackUrl = "http://cs2000.linkpc.net:3000/";
        Log.d(TAG, "Using fallback URL for updates: " + fallbackUrl);
        return fallbackUrl;
    }

    @Override
    public void onBackPressed() {
        if (doubleBackToExitPressedOnce) {
            // Force exit the app
            finishAffinity(); // Close all activities in the task
            System.exit(0); // Terminate the app process
            return;
        }

        this.doubleBackToExitPressedOnce = true;
        Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();

        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                doubleBackToExitPressedOnce = false;
            }
        }, 2000); // Wait 2 seconds before resetting the flag
    }
}