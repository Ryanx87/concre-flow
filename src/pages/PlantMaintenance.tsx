import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  BarChart3,
  PlusCircle,
  Edit,
  Activity,
  TrendingUp,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute, AdminRoute } from '@/components/auth/ProtectedRoute';
import { 
  plantMaintenanceService, 
  MaintenanceEquipment, 
  MaintenanceTask, 
  MaintenanceStatistics
} from '@/services/plantMaintenanceService';

const PlantMaintenance = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [equipment, setEquipment] = useState<MaintenanceEquipment[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [statistics, setStatistics] = useState<MaintenanceStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<MaintenanceEquipment | null>(null);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'Mixer' as MaintenanceEquipment['type'],
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'Operational' as MaintenanceEquipment['status'],
    installationDate: '',
    maintenanceInterval: 90,
    condition: 'Good' as MaintenanceEquipment['condition'],
    criticality: 'Medium' as MaintenanceEquipment['criticality']
  });

  const [newTask, setNewTask] = useState({
    equipmentId: '',
    title: '',
    description: '',
    type: 'Preventive' as MaintenanceTask['type'],
    priority: 'Medium' as MaintenanceTask['priority'],
    assignedTo: '',
    assignedToName: '',
    estimatedDuration: 4,
    estimatedCost: 1000,
    scheduledDate: '',
    instructions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentData, tasksData, statsData] = await Promise.all([
        plantMaintenanceService.getEquipment(),
        plantMaintenanceService.getTasks(),
        plantMaintenanceService.getMaintenanceStatistics()
      ]);
      
      setEquipment(equipmentData);
      setTasks(tasksData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'under maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'scheduled maintenance': return 'bg-blue-100 text-blue-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEquipment = async () => {
    try {
      await plantMaintenanceService.createEquipment({
        ...newEquipment,
        lastMaintenanceDate: new Date().toISOString().split('T')[0],
        nextMaintenanceDate: new Date(Date.now() + newEquipment.maintenanceInterval * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        operatingHours: 0,
        maxOperatingHours: 8000
      });
      
      await loadData();
      setShowEquipmentDialog(false);
      setNewEquipment({
        name: '',
        type: 'Mixer',
        manufacturer: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'Operational',
        installationDate: '',
        maintenanceInterval: 90,
        condition: 'Good',
        criticality: 'Medium'
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const workOrderNumber = `WO-${new Date().getFullYear()}-${String(tasks.length + 1).padStart(3, '0')}`;
      
      await plantMaintenanceService.createTask({
        ...newTask,
        equipmentName: equipment.find(eq => eq.id === newTask.equipmentId)?.name || '',
        status: 'Scheduled',
        workOrderNumber,
        partsRequired: [],
        checklist: []
      });
      
      await loadData();
      setShowTaskDialog(false);
      setNewTask({
        equipmentId: '',
        title: '',
        description: '',
        type: 'Preventive',
        priority: 'Medium',
        assignedTo: '',
        assignedToName: '',
        estimatedDuration: 4,
        estimatedCost: 1000,
        scheduledDate: '',
        instructions: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Plant Maintenance Management</h1>
                <p className="text-muted-foreground">Monitor and maintain plant equipment</p>
              </div>
            </div>
            <Button onClick={() => navigate('/issues')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Statistics Dashboard */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                      <p className="text-3xl font-bold text-blue-600">{statistics.totalEquipment}</p>
                      <p className="text-xs text-muted-foreground">{statistics.operationalEquipment} operational</p>
                    </div>
                    <Settings className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Equipment Uptime</p>
                      <p className="text-3xl font-bold text-green-600">{statistics.equipmentUptime}%</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Above target</span>
                      </div>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                      <p className="text-3xl font-bold text-red-600">{statistics.overdueTasks}</p>
                      <p className="text-xs text-muted-foreground">Require attention</p>
                    </div>
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                      <p className="text-3xl font-bold text-purple-600">R{statistics.maintenanceCosts.thisMonth.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="equipment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Equipment
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Equipment Tab */}
            <TabsContent value="equipment">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Plant Equipment ({filteredEquipment.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={() => setShowEquipmentDialog(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Equipment
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search equipment..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="under maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="scheduled maintenance">Scheduled Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Next Maintenance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEquipment.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{eq.name}</p>
                              <p className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{eq.type}</Badge>
                          </TableCell>
                          <TableCell>{eq.location}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(eq.status)}>
                              {eq.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getConditionColor(eq.condition)}>
                              {eq.condition}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(eq.nextMaintenanceDate)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedEquipment(eq)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Equipment Details - {eq.name}</DialogTitle>
                                  </DialogHeader>
                                  <EquipmentDetailsView equipment={eq} />
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Maintenance Tasks ({tasks.length})
                    </CardTitle>
                    <Button onClick={() => setShowTaskDialog(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">{task.workOrderNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>{task.equipmentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                             task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                             'bg-yellow-100 text-yellow-800'}`}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignedToName}</TableCell>
                          <TableCell>{formatDate(task.scheduledDate)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Task Details - {task.title}</DialogTitle>
                                  </DialogHeader>
                                  <TaskDetailsView task={task} />
                                </DialogContent>
                              </Dialog>
                              {task.status !== 'Completed' && (
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.filter(task => task.status === 'Scheduled').slice(0, 10).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.equipmentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(task.scheduledDate)} • {task.estimatedDuration}h
                            </p>
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {equipment.filter(eq => eq.condition === 'Critical' || eq.status === 'Down').map((eq) => (
                        <div key={eq.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex-1">
                            <p className="font-medium text-red-800">{eq.name}</p>
                            <p className="text-sm text-red-600">{eq.location}</p>
                            <p className="text-xs text-red-500">
                              Status: {eq.status} • Condition: {eq.condition}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                            <Wrench className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              {statistics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{statistics.mtbf}h</p>
                          <p className="text-sm text-muted-foreground">Mean Time Between Failures</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{statistics.mttr}h</p>
                          <p className="text-sm text-muted-foreground">Mean Time To Repair</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Preventive vs Corrective</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Preventive</span>
                            <span>{statistics.preventiveVsCorrective.preventive} tasks</span>
                          </div>
                          <Progress value={(statistics.preventiveVsCorrective.preventive / (statistics.preventiveVsCorrective.preventive + statistics.preventiveVsCorrective.corrective)) * 100} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Labor Costs</span>
                          <span className="font-medium">R{statistics.costBreakdown.labor.toLocaleString()}</span>
                        </div>
                        <Progress value={(statistics.costBreakdown.labor / statistics.maintenanceCosts.thisMonth) * 100} />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Parts & Materials</span>
                          <span className="font-medium">R{statistics.costBreakdown.parts.toLocaleString()}</span>
                        </div>
                        <Progress value={(statistics.costBreakdown.parts / statistics.maintenanceCosts.thisMonth) * 100} />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total This Month</span>
                          <span>R{statistics.maintenanceCosts.thisMonth.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Add Equipment Dialog */}
          <Dialog open={showEquipmentDialog} onOpenChange={setShowEquipmentDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <label className="text-sm font-medium">Equipment Name *</label>
                  <Input
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main Concrete Mixer #2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <Select 
                    value={newEquipment.type} 
                    onValueChange={(value) => setNewEquipment(prev => ({ ...prev, type: value as MaintenanceEquipment['type'] }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixer">Mixer</SelectItem>
                      <SelectItem value="Conveyor">Conveyor</SelectItem>
                      <SelectItem value="Pump">Pump</SelectItem>
                      <SelectItem value="Weighing System">Weighing System</SelectItem>
                      <SelectItem value="Silo">Silo</SelectItem>
                      <SelectItem value="Generator">Generator</SelectItem>
                      <SelectItem value="Compressor">Compressor</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Manufacturer *</label>
                  <Input
                    value={newEquipment.manufacturer}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="e.g., Liebherr"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Model *</label>
                  <Input
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Mobilmix 2.5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Serial Number *</label>
                  <Input
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="e.g., LBR-2021-001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Batching Plant - Bay 1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Installation Date *</label>
                  <Input
                    type="date"
                    value={newEquipment.installationDate}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, installationDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maintenance Interval (days) *</label>
                  <Input
                    type="number"
                    value={newEquipment.maintenanceInterval}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, maintenanceInterval: parseInt(e.target.value) || 90 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateEquipment} 
                  className="flex-1"
                  disabled={!newEquipment.name || !newEquipment.manufacturer || !newEquipment.model}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
                <Button variant="outline" onClick={() => setShowEquipmentDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Task Dialog */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Equipment *</label>
                  <Select 
                    value={newTask.equipmentId} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, equipmentId: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Task Title *</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Quarterly Maintenance - Mixer Blades"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the maintenance task..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type *</label>
                    <Select 
                      value={newTask.type} 
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value as MaintenanceTask['type'] }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Calibration">Calibration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority *</label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as MaintenanceTask['priority'] }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Scheduled Date *</label>
                    <Input
                      type="datetime-local"
                      value={newTask.scheduledDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Duration (hours) *</label>
                    <Input
                      type="number"
                      value={newTask.estimatedDuration}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 4 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTask} 
                  className="flex-1"
                  disabled={!newTask.equipmentId || !newTask.title || !newTask.description || !newTask.scheduledDate}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowTaskDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminRoute>
  );
};

// Equipment Details Component
const EquipmentDetailsView = ({ equipment }: { equipment: MaintenanceEquipment }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Basic Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Type:</span> {equipment.type}</div>
            <div><span className="text-muted-foreground">Manufacturer:</span> {equipment.manufacturer}</div>
            <div><span className="text-muted-foreground">Model:</span> {equipment.model}</div>
            <div><span className="text-muted-foreground">Serial Number:</span> {equipment.serialNumber}</div>
            <div><span className="text-muted-foreground">Location:</span> {equipment.location}</div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Status & Condition</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Status:</span> 
              <Badge className={`ml-2 ${equipment.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {equipment.status}
              </Badge>
            </div>
            <div><span className="text-muted-foreground">Condition:</span> 
              <Badge className={`ml-2 ${equipment.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {equipment.condition}
              </Badge>
            </div>
            <div><span className="text-muted-foreground">Criticality:</span> {equipment.criticality}</div>
            <div><span className="text-muted-foreground">Operating Hours:</span> {equipment.operatingHours}</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Maintenance Schedule</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Last Maintenance:</span> {new Date(equipment.lastMaintenanceDate).toLocaleDateString()}</div>
          <div><span className="text-muted-foreground">Next Maintenance:</span> {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}</div>
          <div><span className="text-muted-foreground">Maintenance Interval:</span> {equipment.maintenanceInterval} days</div>
          <div><span className="text-muted-foreground">Installation Date:</span> {new Date(equipment.installationDate).toLocaleDateString()}</div>
        </div>
      </div>

      {equipment.specifications && (
        <div>
          <h3 className="font-medium mb-2">Specifications</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(equipment.specifications).map(([key, value]) => (
              <div key={key}><span className="text-muted-foreground">{key}:</span> {value}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Task Details Component
const TaskDetailsView = ({ task }: { task: MaintenanceTask }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Task Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Work Order:</span> {task.workOrderNumber}</div>
            <div><span className="text-muted-foreground">Equipment:</span> {task.equipmentName}</div>
            <div><span className="text-muted-foreground">Type:</span> {task.type}</div>
            <div><span className="text-muted-foreground">Priority:</span> 
              <Badge className={`ml-2 ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Assignment & Schedule</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Assigned To:</span> {task.assignedToName}</div>
            <div><span className="text-muted-foreground">Scheduled Date:</span> {new Date(task.scheduledDate).toLocaleString()}</div>
            <div><span className="text-muted-foreground">Estimated Duration:</span> {task.estimatedDuration} hours</div>
            <div><span className="text-muted-foreground">Estimated Cost:</span> R{task.estimatedCost.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-sm bg-muted/50 p-3 rounded">{task.description}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Instructions</h3>
        <p className="text-sm bg-muted/50 p-3 rounded">{task.instructions}</p>
      </div>

      {task.partsRequired && task.partsRequired.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Parts Required</h3>
          <div className="space-y-2">
            {task.partsRequired.map((part) => (
              <div key={part.id} className="flex justify-between items-center p-2 border rounded text-sm">
                <div>
                  <span className="font-medium">{part.name}</span>
                  <span className="text-muted-foreground ml-2">({part.partNumber})</span>
                </div>
                <div className="text-right">
                  <div>Qty: {part.quantity}</div>
                  <div>R{part.unitCost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantMaintenance;