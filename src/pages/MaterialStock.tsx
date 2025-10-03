import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, AlertTriangle, Plus, Truck, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

interface MaterialStock {
  id: string;
  material: string;
  currentStock: number;
  threshold: number;
  unit: string;
  lastDelivery: string;
  supplier: string;
  status: 'good' | 'low' | 'critical';
}

interface StockDelivery {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  supplier: string;
  deliveryDate: string;
  batchNumber: string;
  cost: number;
}

const MaterialStock = () => {
  const navigate = useNavigate();
  const [showLogForm, setShowLogForm] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    material: '',
    quantity: '',
    supplier: '',
    batchNumber: '',
    cost: '',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  // Mock material stock data
  const [materialStock] = useState<MaterialStock[]>([
    { id: '1', material: 'Cement', currentStock: 70, threshold: 20, unit: 'tonnes', lastDelivery: '2025-10-01', supplier: 'Lafarge', status: 'good' },
    { id: '2', material: 'Coarse Aggregate (19mm)', currentStock: 150, threshold: 50, unit: 'tonnes', lastDelivery: '2025-09-30', supplier: 'Aggregate Suppliers', status: 'good' },
    { id: '3', material: 'Fine Aggregate (Sand)', currentStock: 80, threshold: 30, unit: 'tonnes', lastDelivery: '2025-10-02', supplier: 'Sand Co Ltd', status: 'good' },
    { id: '4', material: 'Fly Ash', currentStock: 15, threshold: 20, unit: 'tonnes', lastDelivery: '2025-09-28', supplier: 'Ash Materials', status: 'low' },
    { id: '5', material: 'Water', currentStock: 5000, threshold: 2000, unit: 'litres', lastDelivery: '2025-10-03', supplier: 'Municipal Water', status: 'good' },
    { id: '6', material: 'Admixture (Plasticizer)', currentStock: 8, threshold: 15, unit: 'litres', lastDelivery: '2025-09-25', supplier: 'Chemical Solutions', status: 'critical' }
  ]);

  // Mock recent deliveries
  const [recentDeliveries] = useState<StockDelivery[]>([
    { id: '1', material: 'Cement', quantity: 25, unit: 'tonnes', supplier: 'Lafarge', deliveryDate: '2025-10-01', batchNumber: 'BAT-2025-001', cost: 12500 },
    { id: '2', material: 'Fine Aggregate', quantity: 40, unit: 'tonnes', supplier: 'Sand Co Ltd', deliveryDate: '2025-10-02', batchNumber: 'BAT-2025-002', cost: 8000 },
    { id: '3', material: 'Water', quantity: 2000, unit: 'litres', supplier: 'Municipal Water', deliveryDate: '2025-10-03', batchNumber: 'BAT-2025-003', cost: 200 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <Package className="w-4 h-4 text-green-600" />;
      case 'low': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculatePercentage = (current: number, threshold: number) => {
    // Assume max capacity is 3x the threshold for percentage calculation
    const maxCapacity = threshold * 5;
    return Math.min((current / maxCapacity) * 100, 100);
  };

  const handleLogDelivery = () => {
    if (!newDelivery.material || !newDelivery.quantity || !newDelivery.supplier) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would make an API call
    console.log('Logging new delivery:', newDelivery);
    alert('Stock delivery logged successfully!');
    setShowLogForm(false);
    setNewDelivery({
      material: '',
      quantity: '',
      supplier: '',
      batchNumber: '',
      cost: '',
      deliveryDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleOrderMaterial = (materialId: string) => {
    const material = materialStock.find(m => m.id === materialId);
    if (material) {
      alert(`Order placed for ${material.material}. Supplier ${material.supplier} will be contacted.`);
    }
  };

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
                <h1 className="text-3xl font-bold">Material Stock Management</h1>
                <p className="text-muted-foreground">Monitor inventory levels and log deliveries</p>
              </div>
            </div>
            <Button onClick={() => setShowLogForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Stock Delivery
            </Button>
          </div>

          {/* Stock Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {materialStock.map((item) => (
              <Card key={item.id} className={`border-l-4 ${
                item.status === 'critical' ? 'border-l-red-500' :
                item.status === 'low' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {item.material}
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Stock</span>
                    <span className="font-bold text-lg">{item.currentStock} {item.unit}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Threshold: {item.threshold} {item.unit}</span>
                      <span>{calculatePercentage(item.currentStock, item.threshold).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.status === 'critical' ? 'bg-red-500' :
                          item.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${calculatePercentage(item.currentStock, item.threshold)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span>{item.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Delivery:</span>
                      <span>{new Date(item.lastDelivery).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {(item.status === 'low' || item.status === 'critical') && (
                    <Button 
                      size="sm" 
                      className="w-full"
                      variant={item.status === 'critical' ? 'destructive' : 'default'}
                      onClick={() => handleOrderMaterial(item.id)}
                    >
                      <Truck className="w-3 h-3 mr-2" />
                      Order Material
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Material</th>
                      <th className="text-left py-2">Quantity</th>
                      <th className="text-left py-2">Supplier</th>
                      <th className="text-left py-2">Batch Number</th>
                      <th className="text-left py-2">Cost (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b">
                        <td className="py-2">{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                        <td className="py-2 font-medium">{delivery.material}</td>
                        <td className="py-2">{delivery.quantity} {delivery.unit}</td>
                        <td className="py-2">{delivery.supplier}</td>
                        <td className="py-2 font-mono text-sm">{delivery.batchNumber}</td>
                        <td className="py-2">R {delivery.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Log Delivery Form */}
          {showLogForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Log Stock Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="material">Material *</Label>
                    <Select value={newDelivery.material} onValueChange={(value) => setNewDelivery({...newDelivery, material: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialStock.map((item) => (
                          <SelectItem key={item.id} value={item.material}>
                            {item.material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={newDelivery.quantity}
                      onChange={(e) => setNewDelivery({...newDelivery, quantity: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Input
                      id="supplier"
                      placeholder="Enter supplier name"
                      value={newDelivery.supplier}
                      onChange={(e) => setNewDelivery({...newDelivery, supplier: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      placeholder="Enter batch number"
                      value={newDelivery.batchNumber}
                      onChange={(e) => setNewDelivery({...newDelivery, batchNumber: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">Cost (R)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="Enter cost"
                      value={newDelivery.cost}
                      onChange={(e) => setNewDelivery({...newDelivery, cost: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={newDelivery.deliveryDate}
                      onChange={(e) => setNewDelivery({...newDelivery, deliveryDate: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleLogDelivery} className="flex-1">
                      Log Delivery
                    </Button>
                    <Button variant="outline" onClick={() => setShowLogForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default MaterialStock;