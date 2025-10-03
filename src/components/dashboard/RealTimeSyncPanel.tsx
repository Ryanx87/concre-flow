import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, Zap, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { realTimeDataService, UserActivity } from '@/services/realTimeDataService';

interface RealTimeSyncPanelProps {
  userRole: 'admin' | 'site-agent';
  userId: string;
  userName: string;
}

export const RealTimeSyncPanel = ({ userRole, userId, userName }: RealTimeSyncPanelProps) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  const [connectionCount, setConnectionCount] = useState(2); // Simulate connected users

  useEffect(() => {
    // Set current user
    realTimeDataService.setCurrentUser(userId, userRole, userName);
    
    // Load initial activities
    setActivities(realTimeDataService.getActivities());
    setLastSync(new Date().toLocaleTimeString());
    
    // Subscribe to real-time updates
    const unsubscribeActivities = realTimeDataService.subscribe('activities', (data, action) => {
      setActivities(realTimeDataService.getActivities());
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('connected');
    });

    const unsubscribeAreas = realTimeDataService.subscribe('projectAreas', (data, action) => {
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('connected');
    });

    const unsubscribeOrders = realTimeDataService.subscribe('orders', (data, action) => {
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('connected');
    });

    // Simulate connection status updates
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance of brief sync
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('connected'), 1000);
      }
      
      // Vary connection count
      setConnectionCount(Math.floor(Math.random() * 3) + 2);
    }, 5000);

    return () => {
      unsubscribeActivities();
      unsubscribeAreas();
      unsubscribeOrders();
      clearInterval(statusInterval);
    };
  }, [userId, userRole, userName]);

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-600';
      case 'syncing': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const forceSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setActivities(realTimeDataService.getActivities());
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('connected');
    }, 1500);
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">Real-Time Sync</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {syncStatus === 'connected' ? 'Live' : 
               syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Connected Users</p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{connectionCount}</span>
              <Badge variant="outline" className="text-xs">
                {userRole === 'admin' ? 'Admin' : 'Agent'}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p className="font-semibold text-blue-700">{lastSync}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-blue-800">Recent Activities</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 p-2 bg-white rounded border text-xs">
                <Activity className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    {activity.userRole === 'admin' ? '👨‍💼' : '🏗️'} {activity.details}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()} • {activity.userRole}
                  </p>
                </div>
                <Badge 
                  variant={activity.action === 'create' ? 'default' : 
                          activity.action === 'update' ? 'secondary' : 'outline'} 
                  className="text-xs"
                >
                  {activity.action}
                </Badge>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-2">
                No recent activities
              </p>
            )}
          </div>
        </div>

        {/* Sync Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={forceSync}
            disabled={syncStatus === 'syncing'}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            Force Sync
          </Button>
          <Badge 
            variant={syncStatus === 'connected' ? 'default' : 'destructive'} 
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'connected' ? 'bg-green-500' : 
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            {syncStatus === 'connected' ? 'Online' : 
             syncStatus === 'syncing' ? 'Syncing' : 'Offline'}
          </Badge>
        </div>

        {/* Sync Info */}
        <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
          <p>✅ Data automatically syncs between all connected users</p>
          <p>🔄 Changes appear instantly across admin and site agent dashboards</p>
          <p>📊 Activity log tracks all modifications with timestamps</p>
        </div>
      </CardContent>
    </Card>
  );
};