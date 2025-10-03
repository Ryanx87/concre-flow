import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Navigation, Phone, Truck, Clock, Route, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';

interface TruckLocation {
  id: string;
  driver: string;
  phone: string;
  status: 'Available' | 'On Route' | 'On Site' | 'Maintenance';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedOrder?: string;
  destination?: string;
  eta?: string;
  speed: number;
  lastUpdate: string;
}

const TruckTracking = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Mock truck data - in a real app this would come from GPS tracking API
  const [trucks] = useState<TruckLocation[]>([
    {
      id: 'TRK-001',
      driver: 'John Smith',
      phone: '+27 82 123 4567',
      status: 'Available',
      location: { lat: -33.9249, lng: 18.4241, address: 'Concre-tek Plant, Cape Town' },
      speed: 0,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'TRK-002',
      driver: 'Mike Johnson',
      phone: '+27 83 234 5678',
      status: 'On Route',
      location: { lat: -33.9350, lng: 18.4400, address: 'N1 Highway, 5km from destination' },
      assignedOrder: 'ORD-001',
      destination: 'Housing Project A',
      eta: '10:30 AM',
      speed: 45,
      lastUpdate: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    },
    {
      id: 'TRK-003',
      driver: 'David Wilson',
      phone: '+27 84 345 6789',
      status: 'On Site',
      location: { lat: -33.9400, lng: 18.4600, address: 'Housing Project A, Cape Town' },
      assignedOrder: 'ORD-002',
      destination: 'Housing Project A',
      speed: 0,
      lastUpdate: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
    },
    {
      id: 'TRK-004',
      driver: 'Sarah Brown',
      phone: '+27 85 456 7890',
      status: 'Maintenance',
      location: { lat: -33.9249, lng: 18.4241, address: 'Concre-tek Plant - Service Bay' },
      speed: 0,
      lastUpdate: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Route': return 'bg-blue-100 text-blue-800';
      case 'On Site': return 'bg-orange-100 text-orange-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <Zap className="w-4 h-4 text-green-600" />;
      case 'On Route': return <Navigation className="w-4 h-4 text-blue-600" />;
      case 'On Site': return <MapPin className="w-4 h-4 text-orange-600" />;
      case 'Maintenance': return <Truck className="w-4 h-4 text-red-600" />;
      default: return <Truck className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCallDriver = (phone: string, driverName: string) => {
    // In a real app, this would integrate with a phone system
    const confirmed = confirm(`Call ${driverName} at ${phone}?`);
    if (confirmed) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleSendMessage = (truckId: string, driverName: string) => {
    // In a real app, this would open a messaging interface
    alert(`Send message to ${driverName} (${truckId})`);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

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
                <h1 className="text-3xl font-bold">GPS Truck Tracking</h1>
                <p className="text-muted-foreground">Real-time location and status monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={realTimeUpdates ? 'default' : 'secondary'}>
                {realTimeUpdates ? 'Live Updates' : 'Paused'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              >
                {realTimeUpdates ? 'Pause' : 'Resume'} Updates
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Truck List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Fleet Status ({trucks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trucks.map((truck) => (
                    <div
                      key={truck.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTruck === truck.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedTruck(truck.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(truck.status)}
                          <span className="font-medium">{truck.id}</span>
                        </div>
                        <Badge className={getStatusColor(truck.status)}>
                          {truck.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{truck.driver}</p>
                        {truck.assignedOrder && (
                          <p className="text-muted-foreground">Order: {truck.assignedOrder}</p>
                        )}
                        {truck.status === 'On Route' && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="w-3 h-3" />
                            <span>ETA: {truck.eta}</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Updated: {getTimeAgo(truck.lastUpdate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Map and Details */}
            <div className="lg:col-span-2">
              {selectedTruck ? (
                <div className="space-y-4">
                  {/* Selected Truck Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        {selectedTruck} - Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const truck = trucks.find(t => t.id === selectedTruck);
                        if (!truck) return null;
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Driver</p>
                                <p className="font-medium">{truck.driver}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{truck.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(truck.status)}>
                                  {truck.status}
                                </Badge>
                              </div>
                              {truck.assignedOrder && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Assigned Order</p>
                                  <p className="font-medium">{truck.assignedOrder}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Current Location</p>
                                <p className="font-medium">{truck.location.address}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Speed</p>
                                <p className="font-medium">{truck.speed} km/h</p>
                              </div>
                              {truck.eta && (
                                <div>
                                  <p className="text-sm text-muted-foreground">ETA</p>
                                  <p className="font-medium text-blue-600">{truck.eta}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-muted-foreground">Last Update</p>
                                <p className="font-medium">{getTimeAgo(truck.lastUpdate)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Live Map View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Interactive Map View</p>
                          <p className="text-sm text-muted-foreground">
                            Real-time GPS tracking would be displayed here
                          </p>
                          {(() => {
                            const truck = trucks.find(t => t.id === selectedTruck);
                            if (truck) {
                              return (
                                <div className="mt-4 text-sm">
                                  <p>Coordinates: {truck.location.lat.toFixed(4)}, {truck.location.lng.toFixed(4)}</p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const truck = trucks.find(t => t.id === selectedTruck);
                        if (!truck) return null;
                        
                        return (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleCallDriver(truck.phone, truck.driver)}
                              className="flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4" />
                              Call Driver
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSendMessage(truck.id, truck.driver)}
                            >
                              Send Message
                            </Button>
                            <Button variant="outline">
                              <Route className="w-4 h-4 mr-2" />
                              View Route
                            </Button>
                            {role === 'admin' && (
                              <Button variant="outline">
                                Update Status
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a truck to view details and tracking</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default TruckTracking;