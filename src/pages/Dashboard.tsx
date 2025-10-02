import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Truck, Building2, PackageCheck, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out',
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'Successfully logged out',
      });
    }
  };

  const stats = [
    { label: 'Active Orders', value: '0', icon: PackageCheck, color: 'text-info' },
    { label: 'Total Sites', value: '0', icon: MapPin, color: 'text-success' },
    { label: 'In Transit', value: '0', icon: Truck, color: 'text-warning' },
    { label: 'Structures', value: '0', icon: Building2, color: 'text-primary' },
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
                <h1 className="text-2xl font-bold">Concre-tek</h1>
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
            Welcome back!
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 text-lg gap-3"
              onClick={() => toast({ title: 'Coming Soon', description: 'Order placement feature' })}
            >
              <PackageCheck className="w-6 h-6" />
              New Order
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-24 text-lg gap-3"
              onClick={() => toast({ title: 'Coming Soon', description: 'Site management feature' })}
            >
              <MapPin className="w-6 h-6" />
              Manage Sites
            </Button>
          </div>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <PackageCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active orders</p>
              <p className="text-sm">Place your first order to get started</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
