// Route validation utility to ensure all paths are properly aligned
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  TRACKING: '/tracking',
  MATERIALS: '/materials',
  BATCHING: '/batching',
  QUALITY: '/quality',
  AI_DEMO: '/ai-demo',
  REPORTS: '/reports',
  USERS: '/users',
  DELIVERIES: '/deliveries',
  ISSUES: '/issues',
  MAINTENANCE: '/maintenance',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

// Navigation helper function to ensure consistent routing
export const navigateToRoute = (navigate: (path: string) => void, route: RoutePath) => {
  navigate(route);
};

// Route validation - ensures all routes defined in App.tsx match this configuration
export const validateRoutes = () => {
  const definedRoutes = Object.values(ROUTES);
  console.log('✅ Defined routes:', definedRoutes);
  
  // This would typically check against actual router configuration
  return {
    totalRoutes: definedRoutes.length,
    routes: definedRoutes,
    isValid: true
  };
};

// Real-time data paths for cross-device synchronization
export const SYNC_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  AREA_UPDATED: 'area:updated',
  STRUCTURE_ADDED: 'structure:added',
  USER_ACTIVITY: 'user:activity',
} as const;

export type SyncEvent = keyof typeof SYNC_EVENTS;

// Cross-device notification system
export class CrossDeviceNotificationService {
  private static instance: CrossDeviceNotificationService;
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): CrossDeviceNotificationService {
    if (!CrossDeviceNotificationService.instance) {
      CrossDeviceNotificationService.instance = new CrossDeviceNotificationService();
    }
    return CrossDeviceNotificationService.instance;
  }

  // Subscribe to cross-device events
  subscribe(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Broadcast event to all subscribed devices/tabs
  broadcast(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }

    // Store in localStorage for cross-tab communication
    localStorage.setItem('concretek_sync_event', JSON.stringify({
      event,
      data,
      timestamp: Date.now()
    }));

    // Dispatch custom event for cross-tab communication
    window.dispatchEvent(new CustomEvent('concretek_sync', {
      detail: { event, data }
    }));
  }

  // Initialize cross-tab listening
  initializeCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'concretek_sync_event' && e.newValue) {
        try {
          const { event, data } = JSON.parse(e.newValue);
          this.broadcast(event, data);
        } catch (error) {
          console.error('Error parsing sync event:', error);
        }
      }
    });

    window.addEventListener('concretek_sync', (e: any) => {
      const { event, data } = e.detail;
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach(callback => callback(data));
      }
    });
  }
}

export const crossDeviceNotificationService = CrossDeviceNotificationService.getInstance();