import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const apkPath = path.join(publicDir, 'SnapShop.apk');

    // Check if the file exists
    if (!fs.existsSync(apkPath)) {
      return NextResponse.json({ 
        error: 'APK file not found' 
      }, { status: 404 });
    }

    // Get file stats
    const stats = fs.statSync(apkPath);
    
    // Format the last modified date
    const lastModified = stats.mtime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get the username
    const username = os.userInfo().username;

    return NextResponse.json({
      lastModified,
      username
    });
  } catch (error) {
    console.error('Error getting APK info:', error);
    return NextResponse.json({ 
      error: 'Failed to get APK info' 
    }, { status: 500 });
  }
}
