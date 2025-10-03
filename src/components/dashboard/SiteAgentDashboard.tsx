import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, Clock, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SiteAgentDashboard = () => {
  const nextDelivery = {
    order_id: "ORD-20251003-001",
    project: "Housing Project A",
    quantity_m3: 30,
    grade: "25MPa",
    slump: "100mm",
    status: "Dispatched",
    delivery_time: "2025-10-03T07:30:00"
  };

  const deliveryTimeline = [
    { time: "07:00", event: "Batching Started", completed: true },
    { time: "07:30", event: "Truck 1 Out", completed: true },
    { time: "08:00", event: "Truck 2 Out", completed: false },
    { time: "09:00", event: "On Site Delivery", completed: false }
  ];

  const orderHistory = [
    { date: "2025-10-01", status: "Delivered", quantity_m3: 40 },
    { date: "2025-10-02", status: "Pending", quantity_m3: 60 }
  ];

  return (
    <div className="space-y-6">
      {/* Next Delivery */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" />
            Next Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-semibold">{nextDelivery.project}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold">{nextDelivery.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-semibold">{nextDelivery.quantity_m3}m³</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade</p>
              <p className="font-semibold">{nextDelivery.grade}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slump</p>
              <p className="font-semibold">{nextDelivery.slump}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-primary">{nextDelivery.status}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Expected: 07:30 AM</span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Delivery Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryTimeline.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-secondary' : 'bg-muted'}`} />
                <div className="flex-1 flex items-center justify-between">
                  <span className={item.completed ? 'font-medium' : 'text-muted-foreground'}>
                    {item.event}
                  </span>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
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
            <MapPin className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderHistory.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{order.date}</p>
                  <p className="text-sm text-muted-foreground">{order.quantity_m3}m³</p>
                </div>
                <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAgentDashboard;
