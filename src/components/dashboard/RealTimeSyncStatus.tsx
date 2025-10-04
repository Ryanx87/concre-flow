import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Wifi,
  WifiOff,
  Users,
  MapPin
} from 'lucide-react';
import { realTimeDataService, UserActivity } from '@/services/realTimeDataService';
import { orderService } from '@/services/orderService';

export const RealTimeSyncStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState(0);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribeActivities = realTimeDataService.subscribe('activities', (activity: UserActivity) => {
      setRecentActivities(prev => [activity, ...prev.slice(0, 4)]);
      setLastSync(new Date().toLocaleTimeString());
      setPendingUpdates(prev => prev + 1);
    });

    const unsubscribeOrders = orderService.subscribe('orderUpdate', (data) => {
      setLastSync(new Date().toLocaleTimeString());
      setPendingUpdates(prev => prev + 1);
    });

    // Simulate connection status
    const connectionCheck = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);

    // Initialize
    setRecentActivities(realTimeDataService.getActivities().slice(0, 5));
    setLastSync(new Date().toLocaleTimeString());

    return () => {
      unsubscribeActivities();
      unsubscribeOrders();
      clearInterval(connectionCheck);
    };
  }, []);

  const formatActivityText = (activity: UserActivity) => {
    const timeAgo = getTimeAgo(activity.timestamp);
    return `${activity.details} (${timeAgo})`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

  const getActivityIcon = (activity: UserActivity) => {
    switch (activity.action) {
      case 'create':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'update':
        return <RefreshCw className="w-3 h-3 text-blue-600" />;
      case 'delete':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      default:
        return <Activity className="w-3 h-3 text-gray-600" />;
    }
  };

  const clearPendingUpdates = () => {
    setPendingUpdates(0);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            Real-time Sync
          </div>
          {pendingUpdates > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={clearPendingUpdates}
            >
              {pendingUpdates} new
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Status:</span>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="text-xs"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Last sync:</span>
          <span className="font-mono">{lastSync || 'Never'}</span>
        </div>

        {/* Recent Activities */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Recent Updates:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                {getActivityIcon(activity)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-tight">
                    {formatActivityText(activity)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-2 h-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {activity.userRole === 'admin' ? 'Admin' : 'Site Agent'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-xs text-muted-foreground text-center py-2">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Live Update Indicator */}
        {isConnected && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            Live updates active
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeSyncStatus;