import { useState, useEffect, useCallback } from 'react';
import localVersion from '../../version.json';

interface ServerVersion {
  version: string;
  buildDate: string;
}

export function useVersionCheck() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  const checkVersion = useCallback(async () => {
    try {
      const response = await fetch('/api/version');
      if (!response.ok) return;
      
      const serverData: ServerVersion = await response.json();
      setServerVersion(serverData.version);
      
      if (serverData.version !== localVersion.version) {
        setNeedsUpdate(true);
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.log('Version check failed:', error);
    }
  }, []);

  const refreshApp = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkVersion();
    
    // Check every 30 seconds
    const interval = setInterval(checkVersion, 30000);
    
    return () => clearInterval(interval);
  }, [checkVersion]);

  return {
    needsUpdate,
    currentVersion: localVersion.version,
    serverVersion,
    refreshApp
  };
}
