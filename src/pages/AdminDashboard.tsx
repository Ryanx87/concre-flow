import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Truck, Building2, PackageCheck, LogOut, Factory, Gauge } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out',
      });
    }
  };

  const plantStatus = {
    capacity: 150,
    currentLoad: 90,
    utilization: '60%',
  };

  const materialStock = [
    { name: 'Cement', level: 70 },
    { name: 'Aggregates', level: 80 },
    { name: 'Admixtures', level: 65 },
    { name: 'Water', level: 85 },
  ];

  const trucks = {
    available: 5,
    inMaintenance: 1,
    onRoute: 3,
  };

  const stats = [
    { label: 'Pending Approval', value: '0', icon: PackageCheck, color: 'text-warning' },
    { label: 'In Production', value: '0', icon: Factory, color: 'text-info' },
    { label: 'On Route', value: '0', icon: Truck, color: 'text-success' },
    { label: 'Utilization', value: plantStatus.utilization, icon: Gauge, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Concre-tek Admin</h1>
                <p className="text-sm text-white/80">by Greenspot Legacy</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plant Status & Material Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-primary" />
                Plant Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="text-sm font-medium">{plantStatus.capacity}m³/day</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Current Load</span>
                    <span className="text-sm font-medium">{plantStatus.currentLoad}m³</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Utilization</span>
                    <span className="text-sm font-bold text-primary">{plantStatus.utilization}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                Material Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materialStock.map((material) => (
                  <div key={material.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{material.name}</span>
                      <span className="text-sm font-medium">{material.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ width: `${material.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trucks & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Truck Fleet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Available</span>
                  <span className="text-2xl font-bold text-success">{trucks.available}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">In Maintenance</span>
                  <span className="text-2xl font-bold text-warning">{trucks.inMaintenance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">On Route</span>
                  <span className="text-2xl font-bold text-info">{trucks.onRoute}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start gap-3"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Order approval feature' })}
                >
                  <PackageCheck className="w-5 h-5" />
                  Approve Orders
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Scheduling feature' })}
                >
                  <Factory className="w-5 h-5" />
                  Schedule Batching
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Reports feature' })}
                >
                  <Gauge className="w-5 h-5" />
                  Generate Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
