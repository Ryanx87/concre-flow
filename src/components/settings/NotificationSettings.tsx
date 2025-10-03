import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellOff, 
  Settings, 
  TestTube, 
  AlertTriangle,
  Clock,
  Truck,
  Package,
  Cloud,
  Shield
} from 'lucide-react';
import { 
  notificationService, 
  PushNotificationConfig 
} from '@/services/notificationService';

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PushNotificationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load existing configuration
    const existingConfig = notificationService.getConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
    
    // Get current permission status
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const handleSaveConfig = async () => {
    if (!config) return;

    setLoading(true);
    try {
      notificationService.saveConfig(config);
      
      toast({
        title: 'Notification Settings Saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save notification settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      setPermissionStatus(notificationService.getPermissionStatus());
      
      if (granted) {
        toast({
          title: 'Permission Granted',
          description: 'You will now receive push notifications.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You will not receive push notifications.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to request permission',
      });
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      await notificationService.sendTestNotification();
      toast({
        title: 'Test Notification Sent',
        description: 'Check if you received the test notification.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Test Failed',
        description: 'Unable to send test notification.',
      });
    } finally {
      setTesting(false);
    }
  };

  const getPermissionStatusBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Not Set</Badge>;
    }
  };

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Notification Settings...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait while we load your configuration.</p>
        </CardContent>
      </Card>
    );
  }

  const isSupported = notificationService.isSupported();
  const hasPermission = permissionStatus === 'granted';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Support & Permission */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Browser Support</h4>
              <p className="text-sm text-muted-foreground">
                {isSupported ? 'Your browser supports push notifications' : 'Your browser does not support push notifications'}
              </p>
            </div>
            <Badge variant={isSupported ? 'default' : 'secondary'}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Permission Status</h4>
              <p className="text-sm text-muted-foreground">
                Current notification permission status
              </p>
            </div>
            {getPermissionStatusBadge()}
          </div>

          {!hasPermission && (
            <Button
              onClick={handleRequestPermission}
              disabled={!isSupported || permissionStatus === 'denied'}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {permissionStatus === 'denied' ? 'Permission Denied' : 'Request Permission'}
            </Button>
          )}
        </div>

        {/* Global Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Global Settings</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all push notifications
              </p>
            </div>
            <Switch
              id="enable-notifications"
              checked={config.enabled}
              onCheckedChange={(enabled) =>
                setConfig({ ...config, enabled })
              }
              disabled={!hasPermission}
            />
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          
          {[
            {
              key: 'urgent_deliveries' as const,
              title: 'Urgent Deliveries',
              description: 'Notifications for urgent delivery updates',
              icon: <Truck className="w-4 h-4" />
            },
            {
              key: 'order_updates' as const,
              title: 'Order Updates',
              description: 'Notifications for order status changes',
              icon: <Package className="w-4 h-4" />
            },
            {
              key: 'weather_alerts' as const,
              title: 'Weather Alerts',
              description: 'Notifications for weather conditions',
              icon: <Cloud className="w-4 h-4" />
            },
            {
              key: 'system_notifications' as const,
              title: 'System Notifications',
              description: 'General system and maintenance updates',
              icon: <Shield className="w-4 h-4" />
            }
          ].map((type) => (
            <div key={type.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {type.icon}
                </div>
                <div>
                  <Label htmlFor={type.key}>{type.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
              <Switch
                id={type.key}
                checked={config.types[type.key]}
                onCheckedChange={(enabled) =>
                  setConfig({
                    ...config,
                    types: { ...config.types, [type.key]: enabled }
                  })
                }
                disabled={!config.enabled || !hasPermission}
              />
            </div>
          ))}
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Disable notifications during specified hours
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={config.quietHours.enabled}
              onCheckedChange={(enabled) =>
                setConfig({
                  ...config,
                  quietHours: { ...config.quietHours, enabled }
                })
              }
              disabled={!config.enabled || !hasPermission}
            />
          </div>

          {config.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="quiet-start"
                    type="time"
                    value={config.quietHours.start}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        quietHours: { ...config.quietHours, start: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="quiet-end"
                    type="time"
                    value={config.quietHours.end}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        quietHours: { ...config.quietHours, end: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveConfig}
            disabled={loading || !hasPermission}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {hasPermission && config.enabled && (
            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={testing}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test'}
            </Button>
          )}
        </div>

        {/* Current Status */}
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.enabled ? (
                <Bell className="w-4 h-4 text-green-600" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium">
                {config.enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
              </span>
            </div>
            {config.quietHours.enabled && (
              <Badge variant="outline">
                Quiet: {config.quietHours.start} - {config.quietHours.end}
              </Badge>
            )}
          </div>
        </div>

        {/* Warning for denied permission */}
        {permissionStatus === 'denied' && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Notifications Blocked
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              You have blocked notifications for this site. To enable them, 
              click the lock icon in your browser's address bar and allow notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

