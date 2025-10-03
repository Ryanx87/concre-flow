import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Package, Truck, Activity, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AdminDashboard = () => {
  const plantStatus = {
    capacity_m3_day: 150,
    current_load_m3: 90,
    utilization: 60
  };

  const materialStock = {
    cement: 70,
    aggregates: 80,
    admixtures: 65,
    water: 85
  };

  const trucks = {
    available: 5,
    in_maintenance: 1,
    on_route: 3
  };

  return (
    <div className="space-y-6">
      {/* Plant Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Plant Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="text-2xl font-bold">{plantStatus.capacity_m3_day}m³</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Load</p>
              <p className="text-2xl font-bold">{plantStatus.current_load_m3}m³</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className="text-2xl font-bold text-primary">{plantStatus.utilization}%</p>
            </div>
          </div>
          <Progress value={plantStatus.utilization} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Material Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(materialStock).map(([material, percentage]) => (
              <div key={material} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{material}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${percentage < 30 ? 'bg-destructive' : ''}`} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Truck Fleet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Truck Fleet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold">{trucks.available}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{trucks.on_route}</p>
                <p className="text-xs text-muted-foreground">On Route</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{trucks.in_maintenance}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
