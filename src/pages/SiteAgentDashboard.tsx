import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Truck, PackageCheck, LogOut, MapPin, Clock, AlertCircle } from 'lucide-react';

const SiteAgentDashboard = () => {
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

  const nextDelivery = {
    orderId: 'ORD-20251003-001',
    project: 'Housing Project A',
    quantity: 30,
    grade: '25MPa',
    slump: '100mm',
    status: 'Dispatched',
    deliveryTime: '07:30',
  };

  const timeline = [
    { time: '07:00', event: 'Batching Started', status: 'completed' },
    { time: '07:30', event: 'Truck 1 Out', status: 'completed' },
    { time: '08:00', event: 'Truck 2 Out', status: 'pending' },
    { time: '09:00', event: 'On Site Delivery', status: 'pending' },
  ];

  const orderHistory = [
    { date: '2025-10-01', status: 'Delivered', quantity: 40 },
    { date: '2025-10-02', status: 'Pending', quantity: 60 },
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
                <p className="text-sm text-white/80">Site Agent Portal</p>
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

        {/* Next Delivery Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Next Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{nextDelivery.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-semibold">{nextDelivery.project}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{nextDelivery.quantity}m³</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                    {nextDelivery.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-semibold">{nextDelivery.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slump</p>
                  <p className="font-semibold">{nextDelivery.slump}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Time</p>
                  <p className="font-semibold">{nextDelivery.deliveryTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-info" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.status === 'completed' ? 'bg-success' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-muted-foreground">{item.time}</p>
                        </div>
                        {item.status === 'completed' && (
                          <span className="text-xs text-success">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderHistory.map((order, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.date}</p>
                      <p className="text-sm text-muted-foreground">{order.quantity}m³</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      order.status === 'Delivered' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                size="lg"
                className="h-20 gap-3"
                onClick={() => toast({ title: 'Coming Soon', description: 'Order placement feature' })}
              >
                <PackageCheck className="w-6 h-6" />
                New Order
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-20 gap-3"
                onClick={() => toast({ title: 'Coming Soon', description: 'Track delivery feature' })}
              >
                <MapPin className="w-6 h-6" />
                Track Delivery
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-20 gap-3"
                onClick={() => toast({ title: 'Coming Soon', description: 'Report issue feature' })}
              >
                <AlertCircle className="w-6 h-6" />
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SiteAgentDashboard;
