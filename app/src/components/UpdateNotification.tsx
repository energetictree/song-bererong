import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface UpdateNotificationProps {
  currentVersion: string;
  serverVersion: string;
  onRefresh: () => void;
}

export function UpdateNotification({ currentVersion, serverVersion, onRefresh }: UpdateNotificationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-amber-900 via-red-900 to-amber-950 border-2 border-amber-500/50 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mb-2">
          New Update Available!
        </h2>
        
        <p className="text-amber-200/80 mb-4">
          A new version of Song Bererong is ready.
        </p>
        
        <div className="bg-black/30 rounded-lg p-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-amber-200/60">Your version:</span>
            <span className="text-amber-200">v{currentVersion}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-amber-200/60">New version:</span>
            <span className="text-green-400 font-semibold">v{serverVersion}</span>
          </div>
        </div>
        
        <Button
          onClick={onRefresh}
          className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 text-white py-6 rounded-xl shadow-lg"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Update Now
        </Button>
        
        <p className="text-amber-200/50 text-xs mt-4">
          Clicking update will refresh the page and bring you to the latest version.
        </p>
      </div>
    </div>
  );
}
