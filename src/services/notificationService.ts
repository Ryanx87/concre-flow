export interface PushNotificationConfig {
  enabled: boolean;
  types: {
    urgent_deliveries: boolean;
    order_updates: boolean;
    weather_alerts: boolean;
    system_notifications: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private config: PushNotificationConfig | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.loadConfig();
    this.initializeServiceWorker();
  }

  // Load configuration from localStorage
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('notification-config');
      if (stored) {
        this.config = JSON.parse(stored);
      } else {
        // Set default configuration
        this.config = {
          enabled: false,
          types: {
            urgent_deliveries: true,
            order_updates: true,
            weather_alerts: true,
            system_notifications: false
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        };
      }
    } catch (error) {
      console.error('Error loading notification config:', error);
      this.config = {
        enabled: false,
        types: {
          urgent_deliveries: true,
          order_updates: true,
          weather_alerts: true,
          system_notifications: false
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      };
    }
  }

  // Save configuration to localStorage
  saveConfig(config: PushNotificationConfig): void {
    try {
      localStorage.setItem('notification-config', JSON.stringify(config));
      this.config = config;
    } catch (error) {
      console.error('Error saving notification config:', error);
    }
  }

  // Get current configuration
  getConfig(): PushNotificationConfig | null {
    return this.config;
  }

  // Initialize service worker
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.config?.enabled === false) {
      throw new Error('Notifications are disabled in settings');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications should be sent (respects quiet hours)
  private shouldSendNotification(): boolean {
    if (!this.config?.enabled) return false;
    
    if (!this.config.quietHours.enabled) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.parseTime(this.config.quietHours.start);
    const endTime = this.parseTime(this.config.quietHours.end);

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime < endTime || currentTime >= startTime;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 13:00)
    return currentTime < startTime || currentTime >= endTime;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Send browser notification
  async sendNotification(payload: NotificationPayload, type?: keyof PushNotificationConfig['types']): Promise<void> {
    if (!this.shouldSendNotification()) {
      console.log('Notification blocked by quiet hours or disabled setting');
      return;
    }

    // Check if this notification type is enabled
    if (type && !this.config?.types[type]) {
      console.log(`Notification type ${type} is disabled`);
      return;
    }

    if (!this.isSupported()) {
      console.warn('Notifications are not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false
      });

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!payload.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle different notification types
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        } else if (payload.data?.action) {
          this.handleNotificationAction(payload.data.action, payload.data);
        }
      };

      return Promise.resolve();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Handle notification actions
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'view_order':
        // Navigate to order details
        window.location.href = `/orders/${data.orderId}`;
        break;
      case 'view_delivery':
        // Navigate to delivery tracking
        window.location.href = `/deliveries/${data.deliveryId}`;
        break;
      case 'open_dashboard':
        // Navigate to dashboard
        window.location.href = '/dashboard';
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  // Send urgent delivery notification
  async sendUrgentDeliveryNotification(deliveryData: {
    orderId: string;
    deliveryId: string;
    eta: string;
    driverName: string;
  }): Promise<void> {
    await this.sendNotification({
      title: '🚛 Urgent Delivery Update',
      body: `Delivery ${deliveryData.deliveryId} arriving in ${deliveryData.eta}. Driver: ${deliveryData.driverName}`,
      tag: `delivery-${deliveryData.deliveryId}`,
      requireInteraction: true,
      data: {
        action: 'view_delivery',
        deliveryId: deliveryData.deliveryId,
        orderId: deliveryData.orderId
      }
    }, 'urgent_deliveries');
  }

  // Send order update notification
  async sendOrderUpdateNotification(orderData: {
    orderId: string;
    status: string;
    message: string;
  }): Promise<void> {
    await this.sendNotification({
      title: '📋 Order Update',
      body: `Order ${orderData.orderId}: ${orderData.message}`,
      tag: `order-${orderData.orderId}`,
      data: {
        action: 'view_order',
        orderId: orderData.orderId
      }
    }, 'order_updates');
  }

  // Send weather alert notification
  async sendWeatherAlertNotification(weatherData: {
    condition: string;
    temperature: number;
    forecast: string;
  }): Promise<void> {
    const isUrgent = weatherData.forecast.includes('Poor') || weatherData.forecast.includes('Caution');
    
    await this.sendNotification({
      title: isUrgent ? '⚠️ Weather Alert' : '🌤️ Weather Update',
      body: `${weatherData.condition} (${weatherData.temperature}°C) - ${weatherData.forecast}`,
      tag: 'weather-update',
      requireInteraction: isUrgent,
      data: {
        action: 'open_dashboard'
      }
    }, 'weather_alerts');
  }

  // Send system notification
  async sendSystemNotification(title: string, message: string, urgent = false): Promise<void> {
    await this.sendNotification({
      title: urgent ? `🚨 ${title}` : `ℹ️ ${title}`,
      body: message,
      tag: 'system-notification',
      requireInteraction: urgent,
      data: {
        action: 'open_dashboard'
      }
    }, 'system_notifications');
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    await this.sendNotification({
      title: '🔔 Test Notification',
      body: 'Push notifications are working correctly!',
      tag: 'test-notification',
      data: {
        action: 'open_dashboard'
      }
    });
  }

  // Clear all notifications
  clearAllNotifications(): void {
    if ('serviceWorker' in navigator && this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    }
  }

  // Get notification statistics
  getNotificationStats(): {
    permission: NotificationPermission;
    supported: boolean;
    enabled: boolean;
    quietHours: boolean;
  } {
    return {
      permission: this.getPermissionStatus(),
      supported: this.isSupported(),
      enabled: this.config?.enabled || false,
      quietHours: this.config?.quietHours.enabled || false
    };
  }
}

export const notificationService = new NotificationService();

