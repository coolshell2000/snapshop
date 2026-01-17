'use client';

import { useState, useEffect } from 'react';

interface ApkInfoProps {
  apkPath?: string;
}

export default function ApkInfo({ apkPath = '/SnapShop.apk' }: ApkInfoProps) {
  const [apkInfo, setApkInfo] = useState<{ lastModified: string | null; username: string | null }>({
    lastModified: null,
    username: null,
  });

  useEffect(() => {
    // Since we can't access file system from client side, we'll fetch the info from an API route
    const fetchApkInfo = async () => {
      try {
        const response = await fetch('/api/apk-info');
        if (response.ok) {
          const data = await response.json();
          setApkInfo({
            lastModified: data.lastModified,
            username: data.username,
          });
        }
      } catch (error) {
        console.error('Failed to fetch APK info:', error);
      }
    };

    fetchApkInfo();
  }, []);

  if (!apkInfo.lastModified && !apkInfo.username) {
    return null; // Don't render if we don't have the info yet
  }

  return (
    <div className="text-xs text-gray-400 mt-1 text-center">
      {apkInfo.lastModified && <div>Last updated: {apkInfo.lastModified}</div>}
      {apkInfo.username && <div>by {apkInfo.username}</div>}
    </div>
  );
}
