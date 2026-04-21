import { supabase } from '@/integrations/supabase/client';

// Public API types (unchanged for backward compatibility with dashboards)
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

// ---------- mappers between DB rows and public API ----------

const dbStructureTypeToUi = (t: string): Structure['type'] => {
  switch (t) {
    case 'foundation': return 'Foundation';
    case 'column':
    case 'beam':
    case 'slab':
    case 'wall':
    case 'staircase': return 'Structural';
    default: return 'General';
  }
};

const uiStructureTypeToDb = (t: string): 'foundation' | 'column' | 'beam' | 'slab' | 'wall' | 'staircase' => {
  const lower = t.toLowerCase();
  if (lower === 'foundation') return 'foundation';
  if (lower === 'paving') return 'slab';
  // 'Structural' / 'General' → default to slab
  return 'slab';
};

const dbOrderStatusToUi = (s: string | null): ConcreteOrder['status'] => {
  switch (s) {
    case 'pending_approval': return 'Pending';
    case 'approved': return 'Confirmed';
    case 'in_production': return 'In Production';
    case 'dispatched': return 'Dispatched';
    case 'delivered': return 'Delivered';
    case 'rejected': return 'Cancelled';
    default: return 'Pending';
  }
};

const uiOrderStatusToDb = (s: ConcreteOrder['status']):
  'pending_approval' | 'approved' | 'in_production' | 'dispatched' | 'delivered' | 'rejected' => {
  switch (s) {
    case 'Pending': return 'pending_approval';
    case 'Confirmed': return 'approved';
    case 'In Production': return 'in_production';
    case 'Dispatched': return 'dispatched';
    case 'Delivered': return 'delivered';
    case 'Cancelled': return 'rejected';
  }
};

const normalizeGrade = (grade: string): '20MPa' | '25MPa' | '30MPa' | '40MPa' | '50MPa' => {
  const g = grade.replace(/\s/g, '').toUpperCase();
  if (g.startsWith('20')) return '20MPa';
  if (g.startsWith('25')) return '25MPa';
  if (g.startsWith('30')) return '30MPa';
  if (g.startsWith('35') || g.startsWith('40')) return '40MPa';
  if (g.startsWith('45') || g.startsWith('50')) return '50MPa';
  return '25MPa';
};

// ---------- Service ----------

class RealTimeDataService {
  private static instance: RealTimeDataService;
  private listeners: Map<string, DataChangeListener[]> = new Map();
  private projectAreas: ProjectArea[] = [];
  private orders: ConcreteOrder[] = [];
  private activities: UserActivity[] = [];
  private currentUser: { id: string; role: string; name: string; companyId?: string } = {
    id: '', role: 'site-agent', name: 'Guest'
  };
  private initialized = false;
  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

  private constructor() {
    this.bootstrap();
  }

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  private async bootstrap() {
    // Pick up auth state and refresh whenever it changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await this.loadCurrentUser(session.user.id);
        await this.refresh();
      } else {
        this.projectAreas = [];
        this.orders = [];
        this.activities = [];
        this.notifyListeners('projectAreas', null, 'reset');
        this.notifyListeners('orders', null, 'reset');
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.loadCurrentUser(session.user.id);
      await this.refresh();
      this.subscribeRealtime();
    }
  }

  private async loadCurrentUser(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, company_id')
      .eq('id', userId)
      .maybeSingle();
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    this.currentUser = {
      id: userId,
      role: roleRow?.role === 'admin' ? 'admin' : 'site-agent',
      name: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'User' : 'User',
      companyId: profile?.company_id ?? undefined,
    };
  }

  private subscribeRealtime() {
    if (this.realtimeChannel) return;
    this.realtimeChannel = supabase
      .channel('rtds-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        await this.refreshOrders();
        this.notifyListeners('orders', null, 'update');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, async () => {
        await this.refreshAreas();
        this.notifyListeners('projectAreas', null, 'update');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'structures' }, async () => {
        await this.refreshAreas();
        this.notifyListeners('projectAreas', null, 'update');
      })
      .subscribe();
  }

  private async refresh() {
    await Promise.all([this.refreshAreas(), this.refreshOrders()]);
    this.initialized = true;
  }

  private async refreshAreas() {
    if (!this.currentUser.companyId) {
      this.projectAreas = [];
      return;
    }
    const { data: sites } = await supabase
      .from('sites')
      .select('id, name, updated_at, structures(id, name, type, concrete_grade, updated_at, status)')
      .eq('company_id', this.currentUser.companyId);

    this.projectAreas = (sites ?? []).map((site: any) => ({
      id: site.id,
      name: site.name,
      progress: 0, // not modelled in DB yet
      lastUpdated: site.updated_at,
      updatedBy: '',
      structures: (site.structures ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        type: dbStructureTypeToUi(s.type),
        recommendedGrade: s.concrete_grade,
        lastUpdated: s.updated_at,
        updatedBy: '',
      })),
    }));
  }

  private async refreshOrders() {
    if (!this.currentUser.companyId) {
      this.orders = [];
      return;
    }
    const { data: rows } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', this.currentUser.companyId)
      .order('created_at', { ascending: false });

    this.orders = (rows ?? []).map((o: any) => ({
      id: o.id,
      projectName: o.project_name ?? 'Untitled project',
      location: '',
      areaId: o.site_id,
      structureId: o.structure_id ?? '',
      volume: Number(o.volume),
      grade: o.concrete_grade,
      slump: o.slump ?? 100,
      deliveryDate: o.delivery_date,
      deliveryTime: o.delivery_time ?? '08:00',
      status: dbOrderStatusToUi(o.status),
      contactName: o.site_contact_name ?? '',
      contactPhone: o.site_contact_phone ?? '',
      specialInstructions: o.special_instructions ?? undefined,
      createdAt: o.created_at,
      createdBy: '',
      lastUpdated: o.updated_at,
      updatedBy: '',
    }));
  }

  // ---------- Subscription API ----------
  subscribe(eventType: string, callback: DataChangeListener) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, []);
    this.listeners.get(eventType)!.push(callback);
    return () => {
      const cbs = this.listeners.get(eventType);
      if (!cbs) return;
      const i = cbs.indexOf(callback);
      if (i > -1) cbs.splice(i, 1);
    };
  }

  private notifyListeners(eventType: string, data: any, action: string) {
    this.listeners.get(eventType)?.forEach(cb => cb(data, action, eventType));
  }

  // ---------- Areas (sites) ----------
  getProjectAreas(): ProjectArea[] {
    return [...this.projectAreas];
  }

  async addArea(name: string, _progress: number): Promise<ProjectArea | null> {
    if (!this.currentUser.companyId) return null;
    const { data, error } = await supabase
      .from('sites')
      .insert({ name, address: name, company_id: this.currentUser.companyId })
      .select()
      .single();
    if (error || !data) return null;
    await this.refreshAreas();
    this.notifyListeners('projectAreas', data, 'create');
    return this.projectAreas.find(a => a.id === data.id) ?? null;
  }

  async removeArea(areaId: string): Promise<boolean> {
    const { error } = await supabase.from('sites').delete().eq('id', areaId);
    if (error) return false;
    await this.refreshAreas();
    this.notifyListeners('projectAreas', { id: areaId }, 'delete');
    return true;
  }

  async updateAreaProgress(_areaId: string, _progress: number, _updatedBy?: string): Promise<boolean> {
    // Progress is not yet a DB column; succeed silently to keep UI working.
    return true;
  }

  // ---------- Structures ----------
  async addStructureToArea(
    areaId: string,
    name: string,
    type: Structure['type'],
    recommendedGrade: string
  ): Promise<Structure | null> {
    const { data, error } = await supabase
      .from('structures')
      .insert({
        site_id: areaId,
        name,
        type: uiStructureTypeToDb(type),
        concrete_grade: normalizeGrade(recommendedGrade),
        volume: 0,
      })
      .select()
      .single();
    if (error || !data) return null;
    await this.refreshAreas();
    this.notifyListeners('projectAreas', data, 'update');
    return {
      id: data.id, name: data.name,
      type: dbStructureTypeToUi(data.type),
      recommendedGrade: data.concrete_grade,
      lastUpdated: data.updated_at, updatedBy: '',
    };
  }

  async removeStructure(_areaId: string, structureId: string): Promise<boolean> {
    const { error } = await supabase.from('structures').delete().eq('id', structureId);
    if (error) return false;
    await this.refreshAreas();
    this.notifyListeners('projectAreas', { id: structureId }, 'delete');
    return true;
  }

  // ---------- Orders ----------
  getOrders(): ConcreteOrder[] {
    return [...this.orders];
  }

  async createOrder(
    orderData: Omit<ConcreteOrder, 'id' | 'createdAt' | 'createdBy' | 'lastUpdated' | 'updatedBy'>
  ): Promise<ConcreteOrder | null> {
    if (!this.currentUser.companyId) return null;
    const { data, error } = await supabase
      .from('orders')
      .insert({
        company_id: this.currentUser.companyId,
        site_id: orderData.areaId,
        structure_id: orderData.structureId || null,
        delivery_date: orderData.deliveryDate,
        delivery_time: orderData.deliveryTime,
        volume: orderData.volume,
        number_of_trucks: Math.max(1, Math.ceil(orderData.volume / 6)),
        concrete_grade: normalizeGrade(orderData.grade),
        slump: orderData.slump,
        special_instructions: orderData.specialInstructions ?? null,
        site_contact_name: orderData.contactName,
        site_contact_phone: orderData.contactPhone,
        project_name: orderData.projectName,
        status: uiOrderStatusToDb(orderData.status),
        order_number: '', // trigger fills if empty
      })
      .select()
      .single();
    if (error || !data) {
      console.error('Order insert failed', error);
      return null;
    }
    await this.refreshOrders();
    const created = this.orders.find(o => o.id === data.id) ?? null;
    if (created) this.notifyListeners('orders', created, 'create');
    return created;
  }

  async updateOrderStatus(orderId: string, status: ConcreteOrder['status']): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status: uiOrderStatusToDb(status) })
      .eq('id', orderId);
    if (error) return false;
    await this.refreshOrders();
    const updated = this.orders.find(o => o.id === orderId);
    if (updated) this.notifyListeners('orders', updated, 'update');
    return true;
  }

  // ---------- Activities (in-memory only for now) ----------
  getActivities(): UserActivity[] {
    return [...this.activities];
  }

  // ---------- User helpers ----------
  setCurrentUser(_userId: string, _role: 'admin' | 'site-agent', _name: string) {
    // No-op: identity comes from Supabase auth automatically.
  }

  getCurrentUser() {
    return { ...this.currentUser };
  }
}

export const realTimeDataService = RealTimeDataService.getInstance();
