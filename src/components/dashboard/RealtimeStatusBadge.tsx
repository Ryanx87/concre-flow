import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { RealtimeSyncStatus } from '@/hooks/useRealtimeSync';

interface RealtimeStatusBadgeProps {
  status: RealtimeSyncStatus;
}

export const RealtimeStatusBadge = ({ status }: RealtimeStatusBadgeProps) => {
  const formatLastSync = () => {
    if (!status.lastSync) return 'Not synced';
    const now = new Date();
    const diff = now.getTime() - status.lastSync.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return status.lastSync.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={status.connected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {status.connected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </Badge>
      
      {status.connected && status.syncCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="w-3 h-3 animate-pulse text-green-500" />
          <span>{formatLastSync()}</span>
        </div>
      )}
    </div>
  );
};
