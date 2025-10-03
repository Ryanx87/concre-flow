import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Eye, Edit, CheckCircle, Clock, Truck, MapPin, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';

const OrderManagement = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock order data - in a real app this would come from an API
  const orders = [
    { id: 'ORD-001', site: 'Housing Project A', volume: 30, grade: '25MPa', priority: 'high', status: 'Pending', created: '2025-10-03T06:00:00', contact: 'John Smith', phone: '+27 82 123 4567', location: '123 Main Street, Cape Town' },
    { id: 'ORD-002', site: 'Commercial Complex', volume: 45, grade: '30MPa', priority: 'medium', status: 'Approved', created: '2025-10-03T08:00:00', contact: 'Mike Johnson', phone: '+27 83 234 5678', location: '456 Oak Avenue, Johannesburg' },
    { id: 'ORD-003', site: 'Bridge Construction', volume: 25, grade: '35MPa', priority: 'low', status: 'In Production', created: '2025-10-03T10:00:00', contact: 'Sarah Wilson', phone: '+27 84 345 6789', location: '789 Bridge Road, Durban' },
    { id: 'ORD-004', site: 'Road Extension', volume: 60, grade: '20MPa', priority: 'high', status: 'Dispatched', created: '2025-10-03T12:00:00', contact: 'David Brown', phone: '+27 85 456 7890', location: '321 Highway Drive, Port Elizabeth' },
    { id: 'ORD-005', site: 'Shopping Mall', volume: 80, grade: '30MPa', priority: 'medium', status: 'Delivered', created: '2025-10-02T14:00:00', contact: 'Lisa Davis', phone: '+27 86 567 8901', location: '654 Mall Street, Pretoria' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in production': return 'bg-purple-100 text-purple-800';
      case 'dispatched': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`Performing ${action} on order ${orderId}`);
    // In a real app, this would make an API call
    alert(`${action} action performed on order ${orderId}`);
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
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground">Manage concrete orders and track deliveries</p>
              </div>
            </div>
          </div>

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
                    placeholder="Search by order ID, site name, or contact..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in production">In Production</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Site/Project</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.site}</p>
                            <p className="text-sm text-muted-foreground">{order.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.contact}</p>
                            <p className="text-sm text-muted-foreground">{order.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.volume}m³</TableCell>
                        <TableCell>{order.grade}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderAction(order.id, 'View Details')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            {role === 'admin' && order.status === 'Pending' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleOrderAction(order.id, 'Approve')}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            {role === 'admin' && order.status === 'Approved' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleOrderAction(order.id, 'Schedule')}
                              >
                                <Calendar className="w-3 h-3" />
                              </Button>
                            )}
                            {(order.status === 'In Production' || order.status === 'Dispatched') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOrderAction(order.id, 'Track')}
                              >
                                <Truck className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default OrderManagement;