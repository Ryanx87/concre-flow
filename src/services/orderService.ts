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

const PRICE_PER_M3 = 850; // R per m³ — TODO: move to company settings table

class OrderService {
  private static instance: OrderService;
  private subscribers: Map<string, Function[]> = new Map();

  private constructor() {
    realTimeDataService.subscribe('orders', (order, action) => {
      this.notifySubscribers('orderUpdate', { order, action });
    });
  }

  static getInstance(): OrderService {
    if (!OrderService.instance) OrderService.instance = new OrderService();
    return OrderService.instance;
  }

  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    this.subscribers.get(event)!.push(callback);
    return () => {
      const cbs = this.subscribers.get(event);
      if (!cbs) return;
      const i = cbs.indexOf(callback);
      if (i > -1) cbs.splice(i, 1);
    };
  }

  private notifySubscribers(event: string, data: any) {
    this.subscribers.get(event)?.forEach(cb => cb(data));
  }

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
      avgOrderValue: 0,
    };

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.deliveryDate === today);
    const weekOrders = orders.filter(o => o.deliveryDate >= weekAgo);
    stats.todayRevenue = todayOrders.reduce((s, o) => s + o.volume * PRICE_PER_M3, 0);
    stats.weeklyRevenue = weekOrders.reduce((s, o) => s + o.volume * PRICE_PER_M3, 0);
    stats.avgOrderValue = stats.totalOrders > 0 ? stats.weeklyRevenue / stats.totalOrders : 0;
    return stats;
  }

  async createQuickOrder(orderData: QuickOrderData): Promise<ConcreteOrder | null> {
    const projectAreas = realTimeDataService.getProjectAreas();
    const area = projectAreas.find(a => a.id === orderData.area || a.name === orderData.area);
    const structure = area?.structures.find(s => s.id === orderData.structure || s.name === orderData.structure);

    if (!area) {
      console.error('createQuickOrder: no matching site/area for', orderData.area);
      return null;
    }

    const created = await realTimeDataService.createOrder({
      projectName: `Order for ${area.name}`,
      location: orderData.location,
      areaId: area.id,
      structureId: structure?.id ?? '',
      volume: parseFloat(orderData.volume),
      grade: orderData.grade,
      slump: 100,
      deliveryDate: orderData.deliveryDate,
      deliveryTime: orderData.deliveryTime,
      status: 'Pending',
      contactName: orderData.contactName,
      contactPhone: orderData.contactPhone,
      specialInstructions: orderData.specialInstructions,
    });

    if (created) this.notifySubscribers('newOrder', created);
    return created;
  }

  async updateOrderStatus(orderId: string, status: ConcreteOrder['status']): Promise<boolean> {
    const ok = await realTimeDataService.updateOrderStatus(orderId, status);
    if (ok) this.notifySubscribers('statusUpdate', { orderId, status });
    return ok;
  }

  async getOrderById(orderId: string): Promise<ConcreteOrder | null> {
    return realTimeDataService.getOrders().find(o => o.id === orderId) ?? null;
  }

  async getOrdersByStatus(status: ConcreteOrder['status']): Promise<ConcreteOrder[]> {
    return realTimeDataService.getOrders().filter(o => o.status === status);
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<ConcreteOrder[]> {
    return realTimeDataService.getOrders().filter(o => o.deliveryDate >= startDate && o.deliveryDate <= endDate);
  }

  async getDailyOrderTrend(days = 7): Promise<{ date: string; orders: number; volume: number }[]> {
    const orders = realTimeDataService.getOrders();
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.deliveryDate === date);
      trend.push({
        date,
        orders: dayOrders.length,
        volume: dayOrders.reduce((s, o) => s + o.volume, 0),
      });
    }
    return trend;
  }
}

export const orderService = OrderService.getInstance();
