import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, Clock, MapPin, Calendar, Cloud, Plus, Camera, Phone, Navigation, Thermometer, Wind, Settings, CheckCircle, AlertTriangle, FileText, Download, Eye, Truck, User, CalendarDays, History, BarChart3, Building, ShoppingCart, Layers, Edit, Trash2, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weatherService';
import { realTimeDataService, ProjectArea, Structure } from '@/services/realTimeDataService';
import { WeatherSettings } from '@/components/settings/WeatherSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { RealTimeSyncPanel } from './RealTimeSyncPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const SiteAgentDashboard = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [showWeatherSettings, setShowWeatherSettings] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAreaManagement, setShowAreaManagement] = useState(false);
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<string | null>(null);
  const [newAreaData, setNewAreaData] = useState({ name: '', progress: 0 });
  const [newStructureData, setNewStructureData] = useState({ name: '', type: 'Foundation', recommendedGrade: '25MPa' });
  const [quickOrderData, setQuickOrderData] = useState({
    area: '',
    structure: '',
    volume: '',
    grade: '25MPa',
    deliveryDate: '',
    deliveryTime: '08:00'
  });

  // Project Areas and Structures - now as state
  const [projectAreas, setProjectAreas] = useState<ProjectArea[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');

  // Area and Structure Management Functions
  const addNewArea = () => {
    if (!newAreaData.name.trim()) {
      alert('Please enter an area name');
      return;
    }
    
    setSyncStatus('syncing');
    try {
      const newArea = realTimeDataService.addArea(newAreaData.name, newAreaData.progress);
      setNewAreaData({ name: '', progress: 0 });
      setSyncStatus('connected');
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to add area:', error);
      setSyncStatus('disconnected');
      alert('Failed to add area. Please try again.');
    }
  };

  const removeArea = (areaId: string) => {
    if (confirm('Are you sure you want to remove this area and all its structures?')) {
      setSyncStatus('syncing');
      try {
        const success = realTimeDataService.removeArea(areaId);
        if (success) {
          if (selectedArea === areaId) {
            setSelectedArea('');
            setSelectedStructure('');
          }
          setSyncStatus('connected');
          setLastSync(new Date().toLocaleTimeString());
        } else {
          throw new Error('Failed to remove area');
        }
      } catch (error) {
        console.error('Failed to remove area:', error);
        setSyncStatus('disconnected');
        alert('Failed to remove area. Please try again.');
      }
    }
  };

  const updateAreaProgress = (areaId: string, progress: number) => {
    setSyncStatus('syncing');
    try {
      const success = realTimeDataService.updateAreaProgress(areaId, progress);
      if (success) {
        setSyncStatus('connected');
        setLastSync(new Date().toLocaleTimeString());
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      setSyncStatus('disconnected');
      alert('Failed to update progress. Please try again.');
    }
  };

  const addStructureToArea = (areaId: string) => {
    if (!newStructureData.name.trim()) {
      alert('Please enter a structure name');
      return;
    }
    
    setSyncStatus('syncing');
    try {
      const newStructure = realTimeDataService.addStructureToArea(
        areaId, 
        newStructureData.name, 
        newStructureData.type as Structure['type'], 
        newStructureData.recommendedGrade
      );
      
      if (newStructure) {
        setNewStructureData({ name: '', type: 'Foundation', recommendedGrade: '25MPa' });
        setSyncStatus('connected');
        setLastSync(new Date().toLocaleTimeString());
      } else {
        throw new Error('Failed to add structure');
      }
    } catch (error) {
      console.error('Failed to add structure:', error);
      setSyncStatus('disconnected');
      alert('Failed to add structure. Please try again.');
    }
  };

  const removeStructure = (areaId: string, structureId: string) => {
    if (confirm('Are you sure you want to remove this structure?')) {
      setSyncStatus('syncing');
      try {
        const success = realTimeDataService.removeStructure(areaId, structureId);
        if (success) {
          if (selectedStructure === structureId) {
            setSelectedStructure('');
          }
          setSyncStatus('connected');
          setLastSync(new Date().toLocaleTimeString());
        } else {
          throw new Error('Failed to remove structure');
        }
      } catch (error) {
        console.error('Failed to remove structure:', error);
        setSyncStatus('disconnected');
        alert('Failed to remove structure. Please try again.');
      }
    }
  };

  const getSelectedStructures = () => {
    const area = projectAreas.find(a => a.id === selectedArea);
    return area ? area.structures : [];
  };

  const getRecommendedGrade = () => {
    const structures = getSelectedStructures();
    const structure = structures.find(s => s.id === selectedStructure);
    return structure ? structure.recommendedGrade : '25MPa';
  };

  const handleQuickOrder = () => {
    if (!quickOrderData.area || !quickOrderData.structure || !quickOrderData.volume) {
      alert('Please fill in all required fields for quick order');
      return;
    }
    
    setSyncStatus('syncing');
    try {
      // Create order using real-time service
      const orderData = {
        projectName: 'Quick Order',
        location: 'Site Location',
        areaId: quickOrderData.area,
        structureId: quickOrderData.structure,
        volume: parseFloat(quickOrderData.volume),
        grade: quickOrderData.grade,
        slump: 100,
        deliveryDate: quickOrderData.deliveryDate,
        deliveryTime: quickOrderData.deliveryTime,
        status: 'Pending' as const,
        contactName: 'Site Agent',
        contactPhone: '+27 82 123 4567',
        specialInstructions: 'Quick order from site agent'
      };
      
      const newOrder = realTimeDataService.createOrder(orderData);
      setSyncStatus('connected');
      setLastSync(new Date().toLocaleTimeString());
      
      alert(`Quick order submitted for ${quickOrderData.volume}m³ of ${quickOrderData.grade} concrete (Order ID: ${newOrder.id})`);
      
      // Reset form
      setQuickOrderData({
        area: '',
        structure: '',
        volume: '',
        grade: '25MPa',
        deliveryDate: '',
        deliveryTime: '08:00'
      });
      setSelectedArea('');
      setSelectedStructure('');
    } catch (error) {
      console.error('Failed to create order:', error);
      setSyncStatus('disconnected');
      alert('Failed to submit order. Please try again.');
    }
  };

  const handleCallDriver = (phone: string, driverName: string) => {
    const confirmed = confirm(`Call ${driverName} at ${phone}?`);
    if (confirmed) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleEmergencyCall = (contact: { name: string; phone: string; role: string }) => {
    const confirmed = confirm(`Call ${contact.name} (${contact.role}) at ${contact.phone}?`);
    if (confirmed) {
      window.open(`tel:${contact.phone}`, '_self');
    }
  };

  // Next Delivery Data
  const nextDelivery = {
    order_id: "ORD-20251003-001",
    project: "Housing Project A",
    location: "123 Main Street, Cape Town",
    quantity_m3: 30,
    grade: "25MPa",
    slump: "100mm",
    status: "Dispatched",
    delivery_time: "2025-10-03T07:30:00",
    truck_id: "TRK-002",
    driver: "Mike Johnson",
    driver_phone: "+27 82 123 4567",
    eta: "10:30 AM"
  };

  // Order Timeline
  const deliveryTimeline = [
    { time: "06:00", event: "Batching Started", completed: true, description: "Concrete mixing initiated at plant" },
    { time: "07:30", event: "Truck Dispatched", completed: true, description: "TRK-002 departed from plant" },
    { time: "08:45", event: "En Route", completed: true, description: "Truck is 15km from site" },
    { time: "10:30", event: "On Site Delivery", completed: false, description: "Expected arrival time" }
  ];

  // Order History
  const orderHistory = [
    { id: "ORD-001", date: "2025-10-01", status: "Delivered", quantity_m3: 40, grade: "25MPa", project: "Housing Project A" },
    { id: "ORD-002", date: "2025-10-02", status: "Pending", quantity_m3: 60, grade: "30MPa", project: "Commercial Complex" },
    { id: "ORD-003", date: "2025-09-30", status: "Delivered", quantity_m3: 25, grade: "20MPa", project: "Bridge Construction" }
  ];

  // Today's Deliveries Timeline
  const todaysDeliveries = [
    { id: "TRK-001", project: "Housing Project A", eta: "10:30 AM", status: "In Transit", driver: "John Smith", order_id: "ORD-001", quantity: 30 },
    { id: "TRK-002", project: "Commercial Complex", eta: "2:15 PM", status: "Loading", driver: "Mike Johnson", order_id: "ORD-002", quantity: 45 },
    { id: "TRK-003", project: "Bridge Construction", eta: "4:45 PM", status: "Scheduled", driver: "David Wilson", order_id: "ORD-003", quantity: 25 }
  ];

  // Project Reports Data
  const projectReports = {
    total_ordered: 125,
    total_delivered: 100,
    outstanding: 25,
    rejected_loads: 2,
    on_time_delivery: 92.5
  };

  // Load data and set up real-time sync
  useEffect(() => {
    // Initialize real-time data service
    realTimeDataService.setCurrentUser('site-agent-1', 'site-agent', 'Site Agent');
    
    // Load initial data
    setProjectAreas(realTimeDataService.getProjectAreas());
    setLastSync(new Date().toLocaleTimeString());
    
    // Subscribe to real-time updates
    const unsubscribeAreas = realTimeDataService.subscribe('projectAreas', (data, action) => {
      if (action === 'create' || action === 'update') {
        setProjectAreas(realTimeDataService.getProjectAreas());
        setLastSync(new Date().toLocaleTimeString());
      } else if (action === 'delete') {
        setProjectAreas(realTimeDataService.getProjectAreas());
        setLastSync(new Date().toLocaleTimeString());
      }
    });

    const unsubscribeOrders = realTimeDataService.subscribe('orders', (data, action) => {
      // Handle order updates if needed
      setLastSync(new Date().toLocaleTimeString());
    });

    const unsubscribeActivities = realTimeDataService.subscribe('activities', (data, action) => {
      // Handle activity updates if needed
      setLastSync(new Date().toLocaleTimeString());
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeAreas();
      unsubscribeOrders();
      unsubscribeActivities();
    };
  }, []);

  // Load weather data on component mount
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setWeatherLoading(true);
        const data = await weatherService.getWeatherData();
        setWeatherData(data);
      } catch (error) {
        console.error('Error loading weather data:', error);
        // Set fallback data
        setWeatherData({
          temperature: 28,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          forecast: "Good for concrete pouring",
          icon: "02d",
          location: "Site Location",
          timestamp: new Date().toISOString()
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  const emergencyContacts = [
    { name: "Plant Manager", phone: "+1-555-0101", role: "Production Issues" },
    { name: "Quality Control", phone: "+1-555-0102", role: "Quality Concerns" },
    { name: "Dispatch Center", phone: "+1-555-0103", role: "Delivery Issues" },
    { name: "Emergency Line", phone: "+1-555-0104", role: "Urgent Problems" }
  ];

  return (
    <div className="site-agent-mobile">
      {/* Priority Concrete Ordering Section */}
      <Card className="border-2 border-green-600 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Quick Order Concrete</span>
              <div className="flex items-center gap-1 ml-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-600">
                  {syncStatus === 'connected' ? 'Live' : 
                   syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
                </span>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">Priority</Badge>
            {lastSync && (
              <Badge variant="outline" className="text-xs">
                Last sync: {lastSync}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Area Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Select Area</Label>
              <Select value={selectedArea} onValueChange={(value) => {
                setSelectedArea(value);
                setSelectedStructure('');
                setQuickOrderData({ ...quickOrderData, area: value, structure: '' });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose project area" />
                </SelectTrigger>
                <SelectContent>
                  {projectAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{area.name}</span>
                        <Badge variant="outline" className="ml-2">{area.progress}%</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Structure Selection */}
            <div>
              <Label htmlFor="structure">Select Structure</Label>
              <Select 
                value={selectedStructure} 
                onValueChange={(value) => {
                  setSelectedStructure(value);
                  const recommendedGrade = getRecommendedGrade();
                  setQuickOrderData({ ...quickOrderData, structure: value, grade: recommendedGrade });
                }}
                disabled={!selectedArea}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedArea ? "Choose structure" : "Select area first"} />
                </SelectTrigger>
                <SelectContent>
                  {getSelectedStructures().map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{structure.name}</span>
                        <Badge variant="outline" className="ml-2">{structure.recommendedGrade}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Order Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input 
                id="volume" 
                type="number" 
                placeholder="25" 
                value={quickOrderData.volume}
                onChange={(e) => setQuickOrderData({ ...quickOrderData, volume: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="grade">Concrete Grade</Label>
              <Select 
                value={quickOrderData.grade} 
                onValueChange={(value) => setQuickOrderData({ ...quickOrderData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10MPa">10MPa - Mass Concrete</SelectItem>
                  <SelectItem value="15MPa">15MPa - Blinding</SelectItem>
                  <SelectItem value="20MPa">20MPa - General</SelectItem>
                  <SelectItem value="25MPa">25MPa - Foundation</SelectItem>
                  <SelectItem value="30MPa">30MPa - Structural</SelectItem>
                  <SelectItem value="35MPa">35MPa - High Strength</SelectItem>
                  <SelectItem value="40MPa">40MPa - Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="delivery_date">Delivery Date</Label>
              <Input 
                id="delivery_date" 
                type="date" 
                value={quickOrderData.deliveryDate}
                onChange={(e) => setQuickOrderData({ ...quickOrderData, deliveryDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="delivery_time">Time</Label>
              <Select 
                value={quickOrderData.deliveryTime} 
                onValueChange={(value) => setQuickOrderData({ ...quickOrderData, deliveryTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">06:00 AM</SelectItem>
                  <SelectItem value="08:00">08:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleQuickOrder}>
              <Plus className="w-4 h-4 mr-2" />
              Quick Order
            </Button>
            <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Advanced Order Form</DialogTitle>
                </DialogHeader>
                {/* Advanced order form content */}
              </DialogContent>
            </Dialog>
            <Dialog open={showAreaManagement} onOpenChange={setShowAreaManagement}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Areas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage Project Areas & Structures</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Add New Area */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-medium mb-3 text-blue-800">Add New Area</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="new_area_name">Area Name</Label>
                        <Input 
                          id="new_area_name" 
                          placeholder="e.g., Foundation Zone D" 
                          value={newAreaData.name}
                          onChange={(e) => setNewAreaData({ ...newAreaData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new_area_progress">Progress (%)</Label>
                        <Input 
                          id="new_area_progress" 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="0" 
                          value={newAreaData.progress}
                          onChange={(e) => setNewAreaData({ ...newAreaData, progress: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addNewArea} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Area
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Areas */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Existing Areas</h3>
                    {projectAreas.map((area) => (
                      <div key={area.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{area.name}</h4>
                            <Badge variant="outline">{area.progress}% Complete</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={area.progress}
                              onChange={(e) => updateAreaProgress(area.id, parseInt(e.target.value) || 0)}
                              className="w-20 h-8"
                            />
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => removeArea(area.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Add Structure to Area */}
                        <div className="border rounded p-3 bg-white mb-3">
                          <h5 className="text-sm font-medium mb-2">Add Structure to {area.name}</h5>
                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              placeholder="Structure name"
                              value={newStructureData.name}
                              onChange={(e) => setNewStructureData({ ...newStructureData, name: e.target.value })}
                            />
                            <Select 
                              value={newStructureData.type} 
                              onValueChange={(value) => setNewStructureData({ ...newStructureData, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Foundation">Foundation</SelectItem>
                                <SelectItem value="Structural">Structural</SelectItem>
                                <SelectItem value="Paving">Paving</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select 
                              value={newStructureData.recommendedGrade} 
                              onValueChange={(value) => setNewStructureData({ ...newStructureData, recommendedGrade: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15MPa">15MPa</SelectItem>
                                <SelectItem value="20MPa">20MPa</SelectItem>
                                <SelectItem value="25MPa">25MPa</SelectItem>
                                <SelectItem value="30MPa">30MPa</SelectItem>
                                <SelectItem value="35MPa">35MPa</SelectItem>
                                <SelectItem value="40MPa">40MPa</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              onClick={() => addStructureToArea(area.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Existing Structures */}
                        <div className="space-y-2">
                          {area.structures.map((structure) => (
                            <div key={structure.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{structure.name}</span>
                                <Badge variant="outline" className="text-xs">{structure.type}</Badge>
                                <Badge className="text-xs bg-green-600">{structure.recommendedGrade}</Badge>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeStructure(area.id, structure.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          {area.structures.length === 0 && (
                            <p className="text-sm text-gray-500 italic p-2">No structures in this area yet.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowAreaManagement(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Area Progress Overview */}
          {selectedArea && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Area Progress</h4>
              <div className="space-y-2">
                {projectAreas.find(a => a.id === selectedArea)?.structures.map((structure) => (
                  <div key={structure.id} className="flex items-center justify-between text-sm">
                    <span>{structure.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{structure.type}</Badge>
                      <Badge className="text-xs bg-blue-600">{structure.recommendedGrade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Next Delivery Panel */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" />
            Next Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-semibold">{nextDelivery.project}</p>
              <p className="text-xs text-muted-foreground">{nextDelivery.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold">{nextDelivery.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-semibold">{nextDelivery.quantity_m3}m³</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade & Slump</p>
              <p className="font-semibold">{nextDelivery.grade} • {nextDelivery.slump}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Truck & Driver</p>
              <p className="font-semibold">{nextDelivery.truck_id}</p>
              <p className="text-xs text-muted-foreground">{nextDelivery.driver}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-primary">{nextDelivery.status}</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">ETA: {nextDelivery.eta}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleCallDriver(nextDelivery.driver_phone, nextDelivery.driver)}>
              <Phone className="w-4 h-4 mr-2" />
              Call Driver
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryTimeline.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${item.completed ? 'bg-green-500' : 'bg-muted'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={item.completed ? 'font-medium text-green-700' : 'text-muted-foreground'}>
                      {item.event}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate('/tracking')}>
              <Navigation className="w-4 h-4 mr-2" />
              Track Truck
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Arrival
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.id}</p>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.project}</p>
                  <p className="text-xs text-muted-foreground">{order.date} • {order.quantity_m3}m³ • {order.grade}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate('/orders')}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/orders')}>
            <History className="w-4 h-4 mr-2" />
            View Full History
          </Button>
        </CardContent>
      </Card>

      {/* Today's Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Today's Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaysDeliveries.map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{delivery.id}</span>
                  <Badge variant={
                    delivery.status === 'In Transit' ? 'default' : 
                    delivery.status === 'Loading' ? 'secondary' : 'outline'
                  }>
                    {delivery.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{delivery.project}</p>
                <p className="text-xs text-muted-foreground">Driver: {delivery.driver} • {delivery.quantity}m³</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-orange-600">{delivery.eta}</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/tracking')}>Track</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Weather Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                Weather Conditions
              </div>
              <Dialog open={showWeatherSettings} onOpenChange={setShowWeatherSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Weather API Configuration</DialogTitle>
                  </DialogHeader>
                  <WeatherSettings />
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weatherLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading weather data...</p>
              </div>
            ) : weatherData ? (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Thermometer className="w-6 h-6 text-orange-600" />
                    <span className="text-3xl font-bold">{weatherData.temperature}°C</span>
                  </div>
                  <p className="text-lg font-medium">{weatherData.condition}</p>
                  <p className="text-xs text-muted-foreground">{weatherData.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Humidity:</span>
                    <span>{weatherData.humidity}%</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${
                  weatherData.forecast.includes('Good') 
                    ? 'bg-green-50 border-green-200' 
                    : weatherData.forecast.includes('Poor')
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    weatherData.forecast.includes('Good') 
                      ? 'text-green-800' 
                      : weatherData.forecast.includes('Poor')
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    {weatherData.forecast}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Last updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Unable to load weather data</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Order Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project">Project Name</Label>
                      <Input id="project" placeholder="Housing Project A" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="123 Main Street, Cape Town" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="volume">Volume (m³)</Label>
                      <Input id="volume" type="number" placeholder="25" />
                    </div>
                    <div>
                      <Label htmlFor="grade">Concrete Grade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10MPa">10MPa</SelectItem>
                          <SelectItem value="15MPa">15MPa</SelectItem>
                          <SelectItem value="20MPa">20MPa</SelectItem>
                          <SelectItem value="25MPa">25MPa</SelectItem>
                          <SelectItem value="30MPa">30MPa</SelectItem>
                          <SelectItem value="35MPa">35MPa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="slump">Slump (mm)</Label>
                      <Input id="slump" placeholder="100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="delivery_date">Delivery Date</Label>
                      <Input id="delivery_date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="delivery_time">Preferred Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">06:00 AM</SelectItem>
                          <SelectItem value="08:00">08:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="14:00">02:00 PM</SelectItem>
                          <SelectItem value="16:00">04:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact_name">Site Contact Person</Label>
                    <Input id="contact_name" placeholder="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input id="contact_phone" placeholder="+27 82 123 4567" />
                  </div>
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea id="special_instructions" placeholder="Any special requirements or notes..." />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">Submit Order</Button>
                    <Button variant="outline" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Project Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Project Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{projectReports.total_ordered}</p>
              <p className="text-xs text-muted-foreground">Total Ordered (m³)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{projectReports.total_delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered (m³)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{projectReports.outstanding}</p>
              <p className="text-xs text-muted-foreground">Outstanding (m³)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{projectReports.rejected_loads}</p>
              <p className="text-xs text-muted-foreground">Rejected Loads</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>On-Time Delivery Rate</span>
              <span className="font-medium text-green-600">{projectReports.on_time_delivery}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Efficiency</span>
              <span className="font-medium text-blue-600">{Math.round((projectReports.total_delivered / projectReports.total_ordered) * 100)}%</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/reports')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Confirmation & Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Delivery Confirmation & Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Delivery
            </Button>
            <Button variant="outline" className="w-full">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Common Issues</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Late Delivery
              </Button>
              <Button variant="outline" size="sm">
                Wrong Mix
              </Button>
              <Button variant="outline" size="sm">
                Quality Issue
              </Button>
              <Button variant="outline" size="sm">
                Quantity Discrepancy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 touch-target" onClick={() => handleEmergencyCall(contact)}>
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Sync Panel */}
      <RealTimeSyncPanel 
        userRole="site-agent" 
        userId="site-agent-1" 
        userName="Site Agent"
      />

      {/* Site Photos */}
      <PhotoUpload 
        maxPhotos={20}
        siteId="current-site"
        orderId="current-order"
        onUploadComplete={(photos) => {
          console.log('Photos uploaded:', photos);
        }}
      />
    </div>
  );
};

export default SiteAgentDashboard;
