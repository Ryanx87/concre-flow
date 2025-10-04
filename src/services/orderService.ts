import { ConcreteOrder, realTimeDataService } from './realTimeDataService';

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inProductionOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  weeklyRevenue: number;
  avgOrderValue: number;
}

export interface QuickOrderData {
  area: string;
  structure: string;
  volume: string;
  grade: string;
  deliveryDate: string;
  deliveryTime: string;
  contactName: string;
  contactPhone: string;
  location: string;
  specialInstructions?: string;
}

class OrderService {
  private static instance: OrderService;
  private subscribers: Map<string, Function[]> = new Map();

  private constructor() {
    // Subscribe to real-time data service updates
    realTimeDataService.subscribe('orders', (order, action) => {
      this.notifySubscribers('orderUpdate', { order, action });
    });
  }

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Real-time subscription management
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);

    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Order Management Methods
  async getAllOrders(): Promise<ConcreteOrder[]> {
    return realTimeDataService.getOrders();
  }

  async getOrderStatistics(): Promise<OrderStatistics> {
    const orders = realTimeDataService.getOrders();
    
    const stats: OrderStatistics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      confirmedOrders: orders.filter(o => o.status === 'Confirmed').length,
      inProductionOrders: orders.filter(o => o.status === 'In Production').length,
      dispatchedOrders: orders.filter(o => o.status === 'Dispatched').length,
      deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
      todayRevenue: 0,
      weeklyRevenue: 0,
      avgOrderValue: 0
    };

    // Calculate revenue (mock calculation based on volume)
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayOrders = orders.filter(o => o.deliveryDate === today);
    const weekOrders = orders.filter(o => o.deliveryDate >= weekAgo);

    stats.todayRevenue = todayOrders.reduce((sum, order) => sum + (order.volume * 850), 0); // R850 per m³
    stats.weeklyRevenue = weekOrders.reduce((sum, order) => sum + (order.volume * 850), 0);
    stats.avgOrderValue = stats.totalOrders > 0 ? stats.weeklyRevenue / stats.totalOrders : 0;

    return stats;
  }

  async createQuickOrder(orderData: QuickOrderData): Promise<ConcreteOrder> {
    const projectAreas = realTimeDataService.getProjectAreas();
    const area = projectAreas.find(a => a.name === orderData.area);
    const structure = area?.structures.find(s => s.name === orderData.structure);

    const newOrder = realTimeDataService.createOrder({
      projectName: `Order for ${orderData.area}`,
      location: orderData.location,
      areaId: area?.id || '',
      structureId: structure?.id || '',
      volume: parseFloat(orderData.volume),
      grade: orderData.grade,
      slump: 100, // Default slump
      deliveryDate: orderData.deliveryDate,
      deliveryTime: orderData.deliveryTime,
      status: 'Pending',
      contactName: orderData.contactName,
      contactPhone: orderData.contactPhone,
      specialInstructions: orderData.specialInstructions
    });

    // Notify all subscribers about the new order
    this.notifySubscribers('newOrder', newOrder);
    
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: ConcreteOrder['status']): Promise<boolean> {
    const success = realTimeDataService.updateOrderStatus(orderId, status);
    
    if (success) {
      this.notifySubscribers('statusUpdate', { orderId, status });
    }
    
    return success;
  }

  async getOrderById(orderId: string): Promise<ConcreteOrder | null> {
    const orders = realTimeDataService.getOrders();
    return orders.find(o => o.id === orderId) || null;
  }

  async getOrdersByStatus(status: ConcreteOrder['status']): Promise<ConcreteOrder[]> {
    const orders = realTimeDataService.getOrders();
    return orders.filter(o => o.status === status);
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<ConcreteOrder[]> {
    const orders = realTimeDataService.getOrders();
    return orders.filter(o => o.deliveryDate >= startDate && o.deliveryDate <= endDate);
  }

  // Real-time tracking simulation
  simulateOrderProgress(orderId: string): void {
    const statuses: ConcreteOrder['status'][] = ['Pending', 'Confirmed', 'In Production', 'Dispatched', 'Delivered'];
    let currentIndex = 0;

    const progressInterval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        this.updateOrderStatus(orderId, statuses[currentIndex]);
      } else {
        clearInterval(progressInterval);
      }
    }, 30000); // Progress every 30 seconds
  }

  // Analytics methods
  async getDailyOrderTrend(days: number = 7): Promise<{ date: string; orders: number; volume: number }[]> {
    const orders = realTimeDataService.getOrders();
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.deliveryDate === date);
      
      trend.push({
        date,
        orders: dayOrders.length,
        volume: dayOrders.reduce((sum, order) => sum + order.volume, 0)
      });
    }
    
    return trend;
  }
}

export const orderService = OrderService.getInstance();