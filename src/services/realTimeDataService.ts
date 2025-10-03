export interface ProjectArea {
  id: string;
  name: string;
  progress: number;
  structures: Structure[];
  lastUpdated: string;
  updatedBy: string;
}

export interface Structure {
  id: string;
  name: string;
  type: 'Foundation' | 'Structural' | 'Paving' | 'General';
  recommendedGrade: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface ConcreteOrder {
  id: string;
  projectName: string;
  location: string;
  areaId: string;
  structureId: string;
  volume: number;
  grade: string;
  slump: number;
  deliveryDate: string;
  deliveryTime: string;
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Dispatched' | 'Delivered' | 'Cancelled';
  contactName: string;
  contactPhone: string;
  specialInstructions?: string;
  createdAt: string;
  createdBy: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userRole: 'admin' | 'site-agent';
  action: 'create' | 'update' | 'delete';
  resourceType: 'area' | 'structure' | 'order';
  resourceId: string;
  details: string;
  timestamp: string;
}

type DataChangeListener = (data: any, action: string, resourceType: string) => void;

class RealTimeDataService {
  private static instance: RealTimeDataService;
  private listeners: Map<string, DataChangeListener[]> = new Map();
  private projectAreas: ProjectArea[] = [];
  private orders: ConcreteOrder[] = [];
  private activities: UserActivity[] = [];
  private currentUser = { id: 'user-1', role: 'site-agent', name: 'Site Agent' };

  private constructor() {
    this.initializeDefaultData();
    this.setupPeriodicSync();
  }

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  private initializeDefaultData() {
    this.projectAreas = [
      {
        id: 'area-1',
        name: 'Foundation Zone A',
        progress: 65,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
        structures: [
          { 
            id: 'struct-1', 
            name: 'Strip Foundations', 
            type: 'Foundation', 
            recommendedGrade: '25MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-2', 
            name: 'Pile Caps', 
            type: 'Foundation', 
            recommendedGrade: '30MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-3', 
            name: 'Ground Beams', 
            type: 'Structural', 
            recommendedGrade: '30MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          }
        ]
      },
      {
        id: 'area-2',
        name: 'Structural Frame B',
        progress: 40,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
        structures: [
          { 
            id: 'struct-4', 
            name: 'Columns', 
            type: 'Structural', 
            recommendedGrade: '40MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-5', 
            name: 'Beams', 
            type: 'Structural', 
            recommendedGrade: '35MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-6', 
            name: 'Slabs', 
            type: 'Structural', 
            recommendedGrade: '30MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          }
        ]
      },
      {
        id: 'area-3',
        name: 'External Works C',
        progress: 20,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
        structures: [
          { 
            id: 'struct-7', 
            name: 'Driveways', 
            type: 'Paving', 
            recommendedGrade: '25MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-8', 
            name: 'Walkways', 
            type: 'Paving', 
            recommendedGrade: '20MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          },
          { 
            id: 'struct-9', 
            name: 'Retaining Walls', 
            type: 'Structural', 
            recommendedGrade: '35MPa',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
          }
        ]
      }
    ];
  }

  private setupPeriodicSync() {
    // Simulate real-time updates every 5 seconds
    setInterval(() => {
      this.simulateExternalUpdates();
    }, 5000);
  }

  private simulateExternalUpdates() {
    // Simulate updates from other users (admin/agents)
    if (Math.random() > 0.8) { // 20% chance of external update
      const updateTypes = ['progress', 'newOrder', 'orderStatus'];
      const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      switch (updateType) {
        case 'progress':
          this.simulateProgressUpdate();
          break;
        case 'newOrder':
          this.simulateNewOrder();
          break;
        case 'orderStatus':
          this.simulateOrderStatusUpdate();
          break;
      }
    }
  }

  private simulateProgressUpdate() {
    if (this.projectAreas.length > 0) {
      const randomArea = this.projectAreas[Math.floor(Math.random() * this.projectAreas.length)];
      const newProgress = Math.min(100, randomArea.progress + Math.floor(Math.random() * 5));
      
      if (newProgress !== randomArea.progress) {
        this.updateAreaProgress(randomArea.id, newProgress, 'external-user');
      }
    }
  }

  private simulateNewOrder() {
    const newOrder: ConcreteOrder = {
      id: `ord-${Date.now()}`,
      projectName: 'Auto Generated Order',
      location: '123 Construction Site',
      areaId: this.projectAreas[0]?.id || '',
      structureId: this.projectAreas[0]?.structures[0]?.id || '',
      volume: Math.floor(Math.random() * 50) + 10,
      grade: '25MPa',
      slump: 100,
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTime: '08:00',
      status: 'Pending',
      contactName: 'External User',
      contactPhone: '+27 82 000 0000',
      createdAt: new Date().toISOString(),
      createdBy: 'external-user',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'external-user'
    };

    this.orders.push(newOrder);
    this.logActivity('external-user', 'admin', 'create', 'order', newOrder.id, `Created order for ${newOrder.volume}m³`);
    this.notifyListeners('orders', newOrder, 'create');
  }

  private simulateOrderStatusUpdate() {
    if (this.orders.length > 0) {
      const randomOrder = this.orders[Math.floor(Math.random() * this.orders.length)];
      const statuses: ConcreteOrder['status'][] = ['Confirmed', 'In Production', 'Dispatched', 'Delivered'];
      const currentIndex = statuses.indexOf(randomOrder.status);
      
      if (currentIndex < statuses.length - 1) {
        randomOrder.status = statuses[currentIndex + 1];
        randomOrder.lastUpdated = new Date().toISOString();
        randomOrder.updatedBy = 'external-user';
        
        this.logActivity('external-user', 'admin', 'update', 'order', randomOrder.id, `Updated status to ${randomOrder.status}`);
        this.notifyListeners('orders', randomOrder, 'update');
      }
    }
  }

  // Public API Methods
  subscribe(eventType: string, callback: DataChangeListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(eventType: string, data: any, action: string) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data, action, eventType));
    }
  }

  private logActivity(userId: string, userRole: 'admin' | 'site-agent', action: 'create' | 'update' | 'delete', resourceType: 'area' | 'structure' | 'order', resourceId: string, details: string) {
    const activity: UserActivity = {
      id: `activity-${Date.now()}`,
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.activities.unshift(activity);
    this.activities = this.activities.slice(0, 100); // Keep last 100 activities
    this.notifyListeners('activities', activity, 'create');
  }

  // Project Areas Management
  getProjectAreas(): ProjectArea[] {
    return [...this.projectAreas];
  }

  addArea(name: string, progress: number): ProjectArea {
    const newArea: ProjectArea = {
      id: `area-${Date.now()}`,
      name,
      progress,
      structures: [],
      lastUpdated: new Date().toISOString(),
      updatedBy: this.currentUser.id
    };
    
    this.projectAreas.push(newArea);
    this.logActivity(this.currentUser.id, this.currentUser.role as any, 'create', 'area', newArea.id, `Created area: ${name}`);
    this.notifyListeners('projectAreas', newArea, 'create');
    
    return newArea;
  }

  removeArea(areaId: string): boolean {
    const index = this.projectAreas.findIndex(area => area.id === areaId);
    if (index > -1) {
      const removedArea = this.projectAreas.splice(index, 1)[0];
      this.logActivity(this.currentUser.id, this.currentUser.role as any, 'delete', 'area', areaId, `Removed area: ${removedArea.name}`);
      this.notifyListeners('projectAreas', { id: areaId }, 'delete');
      return true;
    }
    return false;
  }

  updateAreaProgress(areaId: string, progress: number, updatedBy?: string): boolean {
    const area = this.projectAreas.find(a => a.id === areaId);
    if (area) {
      const oldProgress = area.progress;
      area.progress = progress;
      area.lastUpdated = new Date().toISOString();
      area.updatedBy = updatedBy || this.currentUser.id;
      
      this.logActivity(
        updatedBy || this.currentUser.id, 
        this.currentUser.role as any, 
        'update', 
        'area', 
        areaId, 
        `Updated progress from ${oldProgress}% to ${progress}%`
      );
      this.notifyListeners('projectAreas', area, 'update');
      return true;
    }
    return false;
  }

  // Structure Management
  addStructureToArea(areaId: string, name: string, type: Structure['type'], recommendedGrade: string): Structure | null {
    const area = this.projectAreas.find(a => a.id === areaId);
    if (area) {
      const newStructure: Structure = {
        id: `struct-${Date.now()}`,
        name,
        type,
        recommendedGrade,
        lastUpdated: new Date().toISOString(),
        updatedBy: this.currentUser.id
      };
      
      area.structures.push(newStructure);
      area.lastUpdated = new Date().toISOString();
      area.updatedBy = this.currentUser.id;
      
      this.logActivity(this.currentUser.id, this.currentUser.role as any, 'create', 'structure', newStructure.id, `Added structure: ${name} to ${area.name}`);
      this.notifyListeners('projectAreas', area, 'update');
      
      return newStructure;
    }
    return null;
  }

  removeStructure(areaId: string, structureId: string): boolean {
    const area = this.projectAreas.find(a => a.id === areaId);
    if (area) {
      const index = area.structures.findIndex(s => s.id === structureId);
      if (index > -1) {
        const removedStructure = area.structures.splice(index, 1)[0];
        area.lastUpdated = new Date().toISOString();
        area.updatedBy = this.currentUser.id;
        
        this.logActivity(this.currentUser.id, this.currentUser.role as any, 'delete', 'structure', structureId, `Removed structure: ${removedStructure.name} from ${area.name}`);
        this.notifyListeners('projectAreas', area, 'update');
        return true;
      }
    }
    return false;
  }

  // Order Management
  getOrders(): ConcreteOrder[] {
    return [...this.orders];
  }

  createOrder(orderData: Omit<ConcreteOrder, 'id' | 'createdAt' | 'createdBy' | 'lastUpdated' | 'updatedBy'>): ConcreteOrder {
    const newOrder: ConcreteOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: this.currentUser.id,
      lastUpdated: new Date().toISOString(),
      updatedBy: this.currentUser.id
    };
    
    this.orders.push(newOrder);
    this.logActivity(this.currentUser.id, this.currentUser.role as any, 'create', 'order', newOrder.id, `Created order for ${newOrder.volume}m³ of ${newOrder.grade}`);
    this.notifyListeners('orders', newOrder, 'create');
    
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: ConcreteOrder['status']): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      order.lastUpdated = new Date().toISOString();
      order.updatedBy = this.currentUser.id;
      
      this.logActivity(this.currentUser.id, this.currentUser.role as any, 'update', 'order', orderId, `Updated status from ${oldStatus} to ${status}`);
      this.notifyListeners('orders', order, 'update');
      return true;
    }
    return false;
  }

  // Activity Management
  getActivities(): UserActivity[] {
    return [...this.activities];
  }

  // User Management
  setCurrentUser(userId: string, role: 'admin' | 'site-agent', name: string, agentInfo?: {
    site?: string;
    company?: string;
    phone?: string;
    email?: string;
  }) {
    this.currentUser = { 
      id: userId, 
      role, 
      name,
      ...agentInfo
    };
  }

  getCurrentUser() {
    return { ...this.currentUser };
  }
}

export const realTimeDataService = RealTimeDataService.getInstance();