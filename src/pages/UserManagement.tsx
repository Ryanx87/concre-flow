import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  User, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Phone,
  MapPin,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'truck' | 'driver' | 'supplier'>('truck');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Mock data
  const [trucks, setTrucks] = useState([
    { id: 'TRK-001', plateNumber: 'CA 123-456', capacity: 8, status: 'Available', driver: 'John Smith', location: 'Plant', lastService: '2024-09-15' },
    { id: 'TRK-002', plateNumber: 'CA 234-567', capacity: 10, status: 'On Route', driver: 'Mike Johnson', location: 'Site A', lastService: '2024-09-20' },
    { id: 'TRK-003', plateNumber: 'CA 345-678', capacity: 12, status: 'Maintenance', driver: null, location: 'Service Bay', lastService: '2024-08-30' },
    { id: 'TRK-004', plateNumber: 'CA 456-789', capacity: 8, status: 'Available', driver: 'David Wilson', location: 'Plant', lastService: '2024-09-25' }
  ]);

  const [drivers, setDrivers] = useState([
    { id: 'DRV-001', name: 'John Smith', phone: '+27 82 123 4567', license: 'EC123456', status: 'Active', assignedTruck: 'TRK-001', experience: '5 years' },
    { id: 'DRV-002', name: 'Mike Johnson', phone: '+27 83 234 5678', license: 'EC234567', status: 'Active', assignedTruck: 'TRK-002', experience: '8 years' },
    { id: 'DRV-003', name: 'David Wilson', phone: '+27 84 345 6789', license: 'EC345678', status: 'Active', assignedTruck: 'TRK-004', experience: '3 years' },
    { id: 'DRV-004', name: 'Sarah Brown', phone: '+27 85 456 7890', license: 'EC456789', status: 'Off Duty', assignedTruck: null, experience: '6 years' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-001', name: 'Cement Co Ltd', contact: 'Jane Doe', phone: '+27 86 567 8901', email: 'orders@cementco.co.za', category: 'Cement', status: 'Active' },
    { id: 'SUP-002', name: 'Aggregate Supplies', contact: 'Tom Wilson', phone: '+27 87 678 9012', email: 'sales@aggregates.co.za', category: 'Aggregates', status: 'Active' },
    { id: 'SUP-003', name: 'Chemical Additives Inc', contact: 'Lisa Parker', phone: '+27 88 789 0123', email: 'info@chemicals.co.za', category: 'Admixtures', status: 'Pending' },
    { id: 'SUP-004', name: 'Steel Fiber Solutions', contact: 'Mark Davis', phone: '+27 89 890 1234', email: 'orders@steelfiber.co.za', category: 'Fibers', status: 'Active' }
  ]);

  const getStatusBadge = (status: string) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'On Route': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-red-100 text-red-800',
      'Active': 'bg-green-100 text-green-800',
      'Off Duty': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const handleAdd = (type: 'truck' | 'driver' | 'supplier') => {
    setDialogType(type);
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const handleEdit = (type: 'truck' | 'driver' | 'supplier', item: any) => {
    setDialogType(type);
    setEditingItem(item);
    setShowAddDialog(true);
  };

  const handleDelete = (type: 'truck' | 'driver' | 'supplier', id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'truck':
          setTrucks(prev => prev.filter(item => item.id !== id));
          break;
        case 'driver':
          setDrivers(prev => prev.filter(item => item.id !== id));
          break;
        case 'supplier':
          setSuppliers(prev => prev.filter(item => item.id !== id));
          break;
      }
    }
  };

  const AddEditDialog = () => {
    const [formData, setFormData] = useState(editingItem || {});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingItem) {
        // Update existing item
        switch (dialogType) {
          case 'truck':
            setTrucks(prev => prev.map(item => item.id === editingItem.id ? { ...formData } : item));
            break;
          case 'driver':
            setDrivers(prev => prev.map(item => item.id === editingItem.id ? { ...formData } : item));
            break;
          case 'supplier':
            setSuppliers(prev => prev.map(item => item.id === editingItem.id ? { ...formData } : item));
            break;
        }
      } else {
        // Add new item
        const newId = `${dialogType.toUpperCase().slice(0, 3)}-${String(Date.now()).slice(-3)}`;
        const newItem = { ...formData, id: newId };
        
        switch (dialogType) {
          case 'truck':
            setTrucks(prev => [...prev, newItem]);
            break;
          case 'driver':
            setDrivers(prev => [...prev, newItem]);
            break;
          case 'supplier':
            setSuppliers(prev => [...prev, newItem]);
            break;
        }
      }
      
      setShowAddDialog(false);
      setFormData({});
    };

    const renderForm = () => {
      switch (dialogType) {
        case 'truck':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber || ''}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="CA 123-456"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (m³)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  placeholder="8"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="On Route">On Route</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Plant"
                />
              </div>
            </div>
          );
        
        case 'driver':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+27 82 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={formData.license || ''}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="EC123456"
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="5 years"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        
        case 'supplier':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cement Co Ltd"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  value={formData.contact || ''}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+27 86 567 8901"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="orders@company.co.za"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cement">Cement</SelectItem>
                    <SelectItem value="Aggregates">Aggregates</SelectItem>
                    <SelectItem value="Admixtures">Admixtures</SelectItem>
                    <SelectItem value="Fibers">Fibers</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {renderForm()}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage trucks, drivers, and suppliers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Route">On Route</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trucks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trucks" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Trucks
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        {/* Trucks Tab */}
        <TabsContent value="trucks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Truck Fleet</CardTitle>
                <Button onClick={() => handleAdd('truck')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Truck
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trucks
                    .filter(truck => 
                      (selectedStatus === 'all' || truck.status === selectedStatus) &&
                      (truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((truck) => (
                    <TableRow key={truck.id}>
                      <TableCell className="font-medium">{truck.id}</TableCell>
                      <TableCell>{truck.plateNumber}</TableCell>
                      <TableCell>{truck.capacity}m³</TableCell>
                      <TableCell>{getStatusBadge(truck.status)}</TableCell>
                      <TableCell>{truck.driver || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {truck.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit('truck', truck)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('truck', truck.id)}>
                            <Trash2 className="w-3 h-3" />
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

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Driver Management</CardTitle>
                <Button onClick={() => handleAdd('driver')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Truck</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers
                    .filter(driver => 
                      (selectedStatus === 'all' || driver.status === selectedStatus) &&
                      (driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       driver.id.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.id}</TableCell>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {driver.phone}
                        </div>
                      </TableCell>
                      <TableCell>{driver.license}</TableCell>
                      <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      <TableCell>{driver.assignedTruck || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit('driver', driver)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('driver', driver.id)}>
                            <Trash2 className="w-3 h-3" />
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

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Supplier Management</CardTitle>
                <Button onClick={() => handleAdd('supplier')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier ID</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers
                    .filter(supplier => 
                      (selectedStatus === 'all' || supplier.status === selectedStatus) &&
                      (supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       supplier.id.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.id}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.contact}</p>
                          <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                          <p className="text-sm text-muted-foreground">{supplier.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit('supplier', supplier)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('supplier', supplier.id)}>
                            <Trash2 className="w-3 h-3" />
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
      </Tabs>

      <AddEditDialog />
    </div>
  );
};

export default UserManagement;