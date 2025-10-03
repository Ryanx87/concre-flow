import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Package, Truck, Activity, AlertTriangle, BarChart3, Users, DollarSign, CheckCircle, Clock, TrendingUp, Settings, FileText, Download, Eye, Edit, MapPin, Calendar, Zap, Thermometer, Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { FleetOverview } from './FleetOverview';
import { useState, useEffect } from 'react';
import { realTimeDataService, ProjectArea, ConcreteOrder, UserActivity } from '@/services/realTimeDataService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Real-time data state
  const [projectAreas, setProjectAreas] = useState<ProjectArea[]>([]);
  const [realtimeOrders, setRealtimeOrders] = useState<ConcreteOrder[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');

  // Initialize real-time data synchronization
  useEffect(() => {
    // Set admin user
    realTimeDataService.setCurrentUser('admin-1', 'admin', 'Admin User');
    
    // Load initial data
    setProjectAreas(realTimeDataService.getProjectAreas());
    setRealtimeOrders(realTimeDataService.getOrders());
    setActivities(realTimeDataService.getActivities());
    setLastSync(new Date().toLocaleTimeString());
    
    // Subscribe to real-time updates
    const unsubscribeAreas = realTimeDataService.subscribe('projectAreas', (data, action) => {
      setProjectAreas(realTimeDataService.getProjectAreas());
      setLastSync(new Date().toLocaleTimeString());
    });

    const unsubscribeOrders = realTimeDataService.subscribe('orders', (data, action) => {
      setRealtimeOrders(realTimeDataService.getOrders());
      setLastSync(new Date().toLocaleTimeString());
    });

    const unsubscribeActivities = realTimeDataService.subscribe('activities', (data, action) => {
      setActivities(realTimeDataService.getActivities());
      setLastSync(new Date().toLocaleTimeString());
    });

    return () => {
      unsubscribeAreas();
      unsubscribeOrders();
      unsubscribeActivities();
    };
  }, []);

  // Plant Status Data
  const plantStatus = {
    capacity_m3_day: 150,
    current_load_m3: 90,
    utilization: 60,
    active_orders: { pending: 3, approved: 8, production: 5, dispatched: 4, delivered: 12 },
    overload_risk: false,
    downtime: false
  };

  // Material Stock Monitoring
  const materialStock = [
    { material: 'Cement', percentage: 70, threshold: 20, status: 'good' },
    { material: 'Aggregates', percentage: 80, threshold: 15, status: 'good' },
    { material: 'Admixtures', percentage: 65, threshold: 25, status: 'good' },
    { material: 'Water', percentage: 85, threshold: 30, status: 'good' }
  ];

  // Truck Fleet & Dispatch
  const trucks = [
    { id: 'TRK-001', status: 'Available', driver: 'John Smith', location: 'Plant', assigned_order: null },
    { id: 'TRK-002', status: 'On Route', driver: 'Mike Johnson', location: 'In Transit', assigned_order: 'ORD-001' },
    { id: 'TRK-003', status: 'On Site', driver: 'David Wilson', location: 'Housing Project A', assigned_order: 'ORD-002' },
    { id: 'TRK-004', status: 'Maintenance', driver: null, location: 'Service Bay', assigned_order: null },
    { id: 'TRK-005', status: 'Available', driver: 'Sarah Brown', location: 'Plant', assigned_order: null }
  ];

  // Order Management (static data for demo)
  const staticOrders = [
    { id: 'ORD-001', site: 'Housing Project A', volume: 30, grade: '25MPa', priority: 'high', status: 'Pending', time: '2h ago', contact: '+27 82 123 4567' },
    { id: 'ORD-002', site: 'Commercial Complex', volume: 45, grade: '30MPa', priority: 'medium', status: 'Approved', time: '4h ago', contact: '+27 83 234 5678' },
    { id: 'ORD-003', site: 'Bridge Construction', volume: 25, grade: '35MPa', priority: 'low', status: 'In Production', time: '6h ago', contact: '+27 84 345 6789' },
    { id: 'ORD-004', site: 'Road Extension', volume: 60, grade: '20MPa', priority: 'high', status: 'Dispatched', time: '1h ago', contact: '+27 85 456 7890' }
  ];

  // Batching Schedule
  const batchingSchedule = [
    { time: '06:00', order: 'ORD-001', volume: 30, grade: '25MPa', status: 'Completed' },
    { time: '08:00', order: 'ORD-002', volume: 45, grade: '30MPa', status: 'In Progress' },
    { time: '10:00', order: 'ORD-003', volume: 25, grade: '35MPa', status: 'Scheduled' },
    { time: '12:00', order: 'ORD-004', volume: 60, grade: '20MPa', status: 'Scheduled' }
  ];

  // Quality & Compliance
  const qualityMetrics = {
    passRate: 96.5,
    testsToday: 12,
    failures: 1,
    avgStrength: '28.5 MPa',
    sansCompliance: 98.2,
    coasGenerated: 15,
    rejectedLoads: 2
  };

  // Production KPIs
  const kpis = {
    today_volume: 120,
    week_volume: 840,
    month_volume: 3200,
    on_time_delivery: 94.5,
    plant_utilization: 78.2,
    rejected_loads: 2.1
  };

  return (
    <div className="space-y-6">
      {/* Plant Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Plant Status
            {plantStatus.overload_risk && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overload Risk
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Daily Capacity</p>
              <p className="text-2xl font-bold">{plantStatus.capacity_m3_day}m³</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Load</p>
              <p className="text-2xl font-bold">{plantStatus.current_load_m3}m³</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className="text-2xl font-bold text-primary">{plantStatus.utilization}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(plantStatus.active_orders).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
          <Progress value={plantStatus.utilization} className="h-2" />
          
          {/* Order Status Breakdown */}
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <p className="text-lg font-semibold text-orange-600">{plantStatus.active_orders.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{plantStatus.active_orders.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600">{plantStatus.active_orders.production}</p>
              <p className="text-xs text-muted-foreground">Production</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{plantStatus.active_orders.dispatched}</p>
              <p className="text-xs text-muted-foreground">Dispatched</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-600">{plantStatus.active_orders.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material Stock Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Material Stock Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialStock.map((item) => (
              <div key={item.material} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.material}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.percentage}%</span>
                    {item.percentage < item.threshold && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={item.percentage} 
                  className={`h-2 ${item.percentage < item.threshold ? '[&>div]:bg-destructive' : ''}`} 
                />
                <p className="text-xs text-muted-foreground">Alert threshold: {item.threshold}%</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/materials')}>
              <Package className="w-4 h-4 mr-2" />
              Log Stock Delivery
            </Button>
          </CardContent>
        </Card>

        {/* Truck Dispatch & Logistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Truck Dispatch & Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{trucks.filter(t => t.status === 'Available').length}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{trucks.filter(t => t.status === 'On Route').length}</p>
                <p className="text-xs text-muted-foreground">On Route</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{trucks.filter(t => t.status === 'On Site').length}</p>
                <p className="text-xs text-muted-foreground">On Site</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{trucks.filter(t => t.status === 'Maintenance').length}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </div>
            </div>
            
            {/* Live Truck Status */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Live Truck Status</h4>
              {trucks.slice(0, 3).map((truck) => (
                <div key={truck.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      truck.status === 'Available' ? 'bg-green-500' :
                      truck.status === 'On Route' ? 'bg-blue-500' :
                      truck.status === 'On Site' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{truck.id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{truck.location}</p>
                    {truck.assigned_order && (
                      <Badge variant="outline" className="text-xs">{truck.assigned_order}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/tracking')}>
              <MapPin className="w-4 h-4 mr-2" />
              GPS Tracking
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Batching & Production Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Batching & Production Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batchingSchedule.map((batch, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{batch.time}</p>
                    <p className="text-xs text-muted-foreground">Start Time</p>
                  </div>
                  <div>
                    <p className="font-medium">{batch.order}</p>
                    <p className="text-sm text-muted-foreground">{batch.volume}m³ • {batch.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    batch.status === 'Completed' ? 'default' :
                    batch.status === 'In Progress' ? 'secondary' : 'outline'
                  }>
                    {batch.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/orders')}>
              <Package className="w-4 h-4 mr-2" />
              Manage Orders
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/users')}>
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Production KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Production KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today's Volume</span>
                <Badge variant="outline">{kpis.today_volume}m³</Badge>
              </div>
              <p className="text-2xl font-bold">{kpis.today_volume}m³</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+12% vs yesterday</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                <Badge variant="outline">{kpis.on_time_delivery}%</Badge>
              </div>
              <p className="text-2xl font-bold text-green-600">{kpis.on_time_delivery}%</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-600">Above target (90%)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plant Utilization</span>
                <Badge variant="outline">{kpis.plant_utilization}%</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">{kpis.plant_utilization}%</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-xs text-purple-600">Optimal range</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-secondary" />
            System Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/users')}>
              <Users className="w-8 h-8 mb-2 text-blue-600" />
              <span className="font-medium">User Management</span>
              <span className="text-xs text-muted-foreground">Trucks, Drivers, Suppliers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/reports')}>
              <BarChart3 className="w-8 h-8 mb-2 text-green-600" />
              <span className="font-medium">Reports & Analytics</span>
              <span className="text-xs text-muted-foreground">Production Insights</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/quality')}>
              <CheckCircle className="w-8 h-8 mb-2 text-purple-600" />
              <span className="font-medium">Quality Control</span>
              <span className="text-xs text-muted-foreground">Test Results & COAs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-3">
                {orders.filter(o => o.status === 'Pending').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge variant={order.priority === 'high' ? 'destructive' : order.priority === 'medium' ? 'default' : 'secondary'}>
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.site}</p>
                      <p className="text-xs text-muted-foreground">{order.grade} • {order.time}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{order.volume}m³</p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" onClick={() => navigate('/orders')} />
                        </Button>
                        <Button size="sm" variant="default">
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="approved" className="space-y-3">
                {orders.filter(o => o.status === 'Approved').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge variant="default">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.site}</p>
                      <p className="text-xs text-muted-foreground">{order.grade} • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.volume}m³</p>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="production" className="space-y-3">
                {orders.filter(o => o.status === 'In Production').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.site}</p>
                      <p className="text-xs text-muted-foreground">{order.grade} • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.volume}m³</p>
                      <Button size="sm" variant="outline" onClick={() => navigate('/tracking')}>Track</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="dispatched" className="space-y-3">
                {orders.filter(o => o.status === 'Dispatched').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge variant="default">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.site}</p>
                      <p className="text-xs text-muted-foreground">{order.grade} • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.volume}m³</p>
                      <Button size="sm" variant="outline" onClick={() => navigate('/tracking')}>Monitor</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Fleet Overview */}
        <FleetOverview />

        {/* Quality & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Quality & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{qualityMetrics.passRate}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{qualityMetrics.testsToday}</p>
                <p className="text-sm text-muted-foreground">Tests Today</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Strength (28-day)</span>
                <span className="font-medium">{qualityMetrics.avgStrength}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>SANS Compliance</span>
                <span className="font-medium text-green-600">{qualityMetrics.sansCompliance}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>COAs Generated</span>
                <span className="font-medium text-blue-600">{qualityMetrics.coasGenerated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rejected Loads</span>
                <span className="font-medium text-red-600">{qualityMetrics.rejectedLoads}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/quality')}>
                <FileText className="w-4 h-4 mr-2" />
                Cube Tests
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/quality')}>
                <Download className="w-4 h-4 mr-2" />
                COAs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporting & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Reporting & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Volume (m³)</p>
              <p className="text-2xl font-bold text-blue-600">{kpis.today_volume}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Weekly Volume (m³)</p>
              <p className="text-2xl font-bold text-green-600">{kpis.week_volume}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+8% vs last week</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Volume (m³)</p>
              <p className="text-2xl font-bold text-purple-600">{kpis.month_volume}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+12% vs last month</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-2xl font-bold text-orange-600">{kpis.on_time_delivery}%</p>
              <p className="text-xs text-muted-foreground">Above target</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Charts
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              <Eye className="w-4 h-4 mr-2" />
              Detailed Reports
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Production Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">New Order Pending Approval</p>
                  <p className="text-sm text-orange-600">ORD-005 from Bridge Construction (35m³)</p>
                </div>
              </div>
              <Badge variant="outline" className="text-orange-600">2m ago</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Material Stock Alert</p>
                  <p className="text-sm text-blue-600">Cement levels at 18% - below threshold</p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-600">15m ago</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Delivery Completed</p>
                  <p className="text-sm text-green-600">ORD-004 delivered to Road Extension</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600">1h ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
