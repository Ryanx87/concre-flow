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
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Navigation,
  Package,
  Activity,
  BarChart3,
  Calendar,
  Download,
  Thermometer,
  Users,
  FileText,
  Camera,
  PenTool
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { deliveryService, DeliveryInfo, DeliveryStatistics } from '@/services/deliveryService';

const DeliveryManagement = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryInfo[]>([]);
  const [statistics, setStatistics] = useState<DeliveryStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryInfo | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionSignature, setCompletionSignature] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
    loadStatistics();
  }, []);

  const loadDeliveries = async () => {
    try {
      const data = await deliveryService.getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await deliveryService.getDeliveryStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.truckId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'en route': return 'bg-orange-100 text-orange-800';
      case 'on site': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const handleConfirmArrival = async () => {
    if (!selectedDelivery) return;

    try {
      await deliveryService.confirmDeliveryArrival(selectedDelivery.id, {
        actualArrival: new Date().toISOString(),
        notes: confirmationNotes
      });
      
      await loadDeliveries();
      setShowConfirmDialog(false);
      setConfirmationNotes('');
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error confirming arrival:', error);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!selectedDelivery || !completionSignature) return;

    try {
      await deliveryService.completeDelivery(selectedDelivery.id, {
        deliveryTime: new Date().toISOString(),
        confirmationSignature: completionSignature,
        notes: completionNotes
      });
      
      await loadDeliveries();
      setShowCompleteDialog(false);
      setCompletionNotes('');
      setCompletionSignature('');
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatETA = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthenticatedRoute>
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
                <h1 className="text-3xl font-bold">Delivery Management</h1>
                <p className="text-muted-foreground">Track and manage concrete deliveries</p>
              </div>
            </div>
            <Button onClick={() => navigate('/issues')} variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Statistics Overview */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Deliveries</p>
                      <p className="text-3xl font-bold text-blue-600">{statistics.activeDeliveries}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Deliveries</p>
                      <p className="text-3xl font-bold text-green-600">{statistics.todaysDeliveries}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                      <p className="text-3xl font-bold text-orange-600">{statistics.onTimePercentage}%</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                      <p className="text-3xl font-bold text-purple-600">{statistics.completedToday}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by delivery ID, order ID, project, truck..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="en route">En Route</SelectItem>
                  <SelectItem value="on site">On Site</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Deliveries Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Deliveries ({filteredDeliveries.length})
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/tracking')}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Live Tracking
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell>{delivery.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{delivery.projectName}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {delivery.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{delivery.truckId}</TableCell>
                      <TableCell>
                        <div>
                          <p>{delivery.driverName}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {delivery.driverPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(delivery.priority)}>
                          {delivery.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                          {delivery.eta || formatETA(delivery.estimatedArrival)}
                        </div>
                      </TableCell>
                      <TableCell>{delivery.volume}m³ {delivery.grade}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Delivery Details - {delivery.id}</DialogTitle>
                              </DialogHeader>
                              <DeliveryDetailsView delivery={delivery} />
                            </DialogContent>
                          </Dialog>
                          
                          {(delivery.status === 'En Route' || delivery.status === 'Dispatched') && role === 'site_agent' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowConfirmDialog(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {delivery.status === 'On Site' && role === 'site_agent' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowCompleteDialog(true);
                              }}
                            >
                              <Package className="w-4 h-4" />
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

          {/* Confirm Arrival Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delivery Arrival</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Confirm that truck {selectedDelivery?.truckId} has arrived at the delivery site?</p>
                <div>
                  <label className="text-sm font-medium">Additional Notes (Optional)</label>
                  <Textarea
                    value={confirmationNotes}
                    onChange={(e) => setConfirmationNotes(e.target.value)}
                    placeholder="Enter any additional notes about the arrival..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleConfirmArrival} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Arrival
                  </Button>
                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Complete Delivery Dialog */}
          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Delivery</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Mark delivery {selectedDelivery?.id} as completed?</p>
                <div>
                  <label className="text-sm font-medium">Confirmation Signature *</label>
                  <Input
                    value={completionSignature}
                    onChange={(e) => setCompletionSignature(e.target.value)}
                    placeholder="Enter your name and title..."
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Notes (Optional)</label>
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Enter any delivery notes or observations..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCompleteDelivery} 
                    className="flex-1"
                    disabled={!completionSignature}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Complete Delivery
                  </Button>
                  <Button variant="outline" onClick={() => setShowCompleteDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

// Delivery Details Component
const DeliveryDetailsView = ({ delivery }: { delivery: DeliveryInfo }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery ID:</span>
              <span className="font-medium">{delivery.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-medium">{delivery.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={`${delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                               delivery.status === 'En Route' ? 'bg-orange-100 text-orange-800' :
                               delivery.status === 'On Site' ? 'bg-purple-100 text-purple-800' :
                               'bg-blue-100 text-blue-800'}`}>
                {delivery.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority:</span>
              <Badge className={`${delivery.priority === 'High' ? 'bg-red-100 text-red-800' : 
                               delivery.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-gray-100 text-gray-800'}`}>
                {delivery.priority}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">{delivery.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium text-right">{delivery.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">{delivery.distance || 'N/A'}km</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Concrete & Truck Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Concrete Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-medium">{delivery.volume}m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{delivery.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slump:</span>
              <span className="font-medium">{delivery.slump || 'N/A'}mm</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Truck & Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Truck ID:</span>
              <span className="font-medium">{delivery.truckId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-medium">{delivery.driverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{delivery.driverPhone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Arrival:</span>
              <span className="font-medium">{new Date(delivery.estimatedArrival).toLocaleString()}</span>
            </div>
            {delivery.dispatchTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispatched:</span>
                <span className="font-medium">{new Date(delivery.dispatchTime).toLocaleString()}</span>
              </div>
            )}
            {delivery.actualArrival && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Arrival:</span>
                <span className="font-medium">{new Date(delivery.actualArrival).toLocaleString()}</span>
              </div>
            )}
            {delivery.deliveryTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{new Date(delivery.deliveryTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather Conditions */}
      {delivery.weatherConditions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature:</span>
                <span className="font-medium">{delivery.weatherConditions.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">{delivery.weatherConditions.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suitable for Pour:</span>
                <Badge className={delivery.weatherConditions.suitableForPour ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {delivery.weatherConditions.suitableForPour ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Tests */}
      {delivery.qualityTests && delivery.qualityTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {delivery.qualityTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{test.type} Test</span>
                    <p className="text-sm text-muted-foreground">Result: {test.result}</p>
                    <p className="text-xs text-muted-foreground">By: {test.testedBy} at {new Date(test.testTime).toLocaleString()}</p>
                  </div>
                  <Badge className={test.passedTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {test.passedTest ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Instructions & Notes */}
      {(delivery.specialInstructions || delivery.deliveryNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {delivery.specialInstructions && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Special Instructions:</h4>
                <p>{delivery.specialInstructions}</p>
              </div>
            )}
            {delivery.deliveryNotes && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Delivery Notes:</h4>
                <p>{delivery.deliveryNotes}</p>
              </div>
            )}
            {delivery.confirmationSignature && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Confirmed By:</h4>
                <p className="font-medium">{delivery.confirmationSignature}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryManagement;