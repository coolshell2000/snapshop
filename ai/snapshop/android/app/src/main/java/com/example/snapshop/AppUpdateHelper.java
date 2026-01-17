package com.example.snapshop;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.RequiresApi;
import androidx.core.content.FileProvider;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class AppUpdateHelper {
    private static final String TAG = "AppUpdateHelper";
    
    private Context context;
    private OkHttpClient httpClient;
    
    public AppUpdateHelper(Context context) {
        this.context = context;
        this.httpClient = new OkHttpClient();
    }
    
    public void checkForUpdates(String baseUrl) {
        Log.d(TAG, "Checking for updates from: " + baseUrl);

        String apkInfoUrl = baseUrl + "apk-info.json";
        String apkDownloadUrl = baseUrl + "SnapShop.apk";

        // Log the full URLs being used
        Log.d(TAG, "Full APK info URL: " + apkInfoUrl);
        Log.d(TAG, "Full APK download URL: " + apkDownloadUrl);

        // Make a request to get APK info
        okhttp3.Request request = new okhttp3.Request.Builder()
                .url(apkInfoUrl)
                .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Failed to check for updates: " + e.getMessage());
                Log.e(TAG, "Failed URL: " + apkInfoUrl);

                // Check if it's a network issue that might be resolved by using HTTP instead of HTTPS
                if (apkInfoUrl.startsWith("https://")) {
                    String httpUrl = apkInfoUrl.replace("https://", "http://");
                    Log.d(TAG, "Attempting fallback to HTTP: " + httpUrl);

                    okhttp3.Request httpRequest = new okhttp3.Request.Builder()
                            .url(httpUrl)
                            .build();

                    httpClient.newCall(httpRequest).enqueue(new Callback() {
                        @Override
                        public void onFailure(Call call, IOException e) {
                            Log.e(TAG, "HTTP fallback also failed: " + e.getMessage());
                        }

                        @Override
                        public void onResponse(Call call, Response response) throws IOException {
                            handleApkInfoResponse(response, baseUrl);
                        }
                    });
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e(TAG, "Unsuccessful response: " + response.code());
                    Log.e(TAG, "Response message: " + response.message());
                    Log.e(TAG, "Failed URL: " + apkInfoUrl);

                    // Try alternative path - also try with public/ prefix in case server structure changes
                    String altApkInfoUrl = baseUrl + "public/apk-info.json";
                    Log.d(TAG, "Trying alternative APK info URL with public/ prefix: " + altApkInfoUrl);

                    okhttp3.Request altRequest = new okhttp3.Request.Builder()
                            .url(altApkInfoUrl)
                            .build();

                    httpClient.newCall(altRequest).enqueue(new Callback() {
                        @Override
                        public void onFailure(Call call, IOException e) {
                            Log.e(TAG, "Failed to check for updates with public/ prefix: " + e.getMessage());
                            Log.e(TAG, "Failed alternative URL: " + altApkInfoUrl);

                            // Try the original alternative path as backup
                            String backupAltApkInfoUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length()-1) + "apk-info.json" : baseUrl + "apk-info.json";
                            Log.d(TAG, "Trying backup alternative APK info URL: " + backupAltApkInfoUrl);

                            okhttp3.Request backupRequest = new okhttp3.Request.Builder()
                                    .url(backupAltApkInfoUrl)
                                    .build();

                            httpClient.newCall(backupRequest).enqueue(new Callback() {
                                @Override
                                public void onFailure(Call call, IOException e) {
                                    Log.e(TAG, "All update check attempts failed: " + e.getMessage());
                                }

                                @Override
                                public void onResponse(Call call, Response response) throws IOException {
                                    handleApkInfoResponse(response, baseUrl);
                                }
                            });
                        }

                        @Override
                        public void onResponse(Call call, Response response) throws IOException {
                            handleApkInfoResponse(response, baseUrl);
                        }
                    });
                    return;
                }

                Log.d(TAG, "Successfully retrieved APK info from: " + apkInfoUrl);
                handleApkInfoResponse(response, baseUrl);
            }
        });
    }

    private void handleApkInfoResponse(Response response, String baseUrl) throws IOException {
        if (!response.isSuccessful()) {
            Log.e(TAG, "Unsuccessful response: " + response.code());
            return;
        }

        try (ResponseBody body = response.body()) {
            if (body != null) {
                String responseBody = body.string();
                Log.d(TAG, "APK info response: " + responseBody);

                // Parse the response to get the last modified time
                JSONObject json = new JSONObject(responseBody);
                String serverLastModified = json.getString("lastModified");

                // For now, we'll just trigger an update check
                String apkDownloadUrl = baseUrl + "SnapShop.apk";
                Log.d(TAG, "Initiating download from full APK URL: " + apkDownloadUrl);
                downloadApk(apkDownloadUrl);
            }
        } catch (IOException | JSONException e) {
            Log.e(TAG, "Error parsing APK info: " + e.getMessage());
        }
    }
    
    private void downloadApk(String downloadUrl) {
        Log.d(TAG, "Starting APK download from full URL: " + downloadUrl);

        DownloadManager downloadManager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);

        Uri uri = Uri.parse(downloadUrl);
        DownloadManager.Request request = new DownloadManager.Request(uri);

        // Set title and description
        request.setTitle("SnapShop Update");
        request.setDescription("Downloading new version from: " + downloadUrl);

        // Set notification visibility
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

        // Set MIME type
        request.setMimeType("application/vnd.android.package-archive");

        // Set allowed network types
        request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);

        // IMPORTANT: Allow HTTP URLs for download manager
        request.setAllowedOverMetered(true);
        request.setAllowedOverRoaming(true);

        // Set file destination
        request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, "SnapShop.apk");

        // Enqueue the download
        long downloadId = downloadManager.enqueue(request);

        // Register broadcast receiver to handle completion
        BroadcastReceiver onComplete = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctxt, Intent intent) {
                long receivedDownloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (receivedDownloadId == downloadId) {
                    Log.d(TAG, "APK download completed from: " + downloadUrl);
                    installApk();
                    try {
                        context.unregisterReceiver(this); // Unregister receiver
                    } catch (IllegalArgumentException e) {
                        Log.w(TAG, "Receiver not registered");
                    }
                }
            }
        };

        context.registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));

        Toast.makeText(context, "Update download started from: " + extractBaseUrl(downloadUrl), Toast.LENGTH_SHORT).show();
    }

    private String extractBaseUrl(String fullUrl) {
        try {
            android.net.Uri uri = android.net.Uri.parse(fullUrl);
            return uri.getHost(); // Return just the host name
        } catch (Exception e) {
            Log.e(TAG, "Error extracting base URL: " + e.getMessage());
            return "cs2000.linkpc.net"; // Fallback
        }
    }
    
    @RequiresApi(api = Build.VERSION_CODES.N)
    private void installApk() {
        try {
            File file = new File(context.getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS), "SnapShop.apk");
            
            if (file.exists()) {
                Uri apkUri = FileProvider.getUriForFile(
                    context,
                    context.getPackageName() + ".fileprovider",
                    file
                );
                
                Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
                intent.setData(apkUri);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                context.startActivity(intent);
                
                Log.d(TAG, "APK installation initiated");
            } else {
                Log.e(TAG, "APK file does not exist at expected location");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error installing APK: " + e.getMessage());
        }
    }
}
