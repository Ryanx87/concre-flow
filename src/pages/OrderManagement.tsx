import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, CheckCircle, Truck, PackageCheck, XCircle, Factory, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type OrderRow = Tables<'orders'>;
type OrderStatus = NonNullable<OrderRow['status']>;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  in_production: 'In Production',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

const statusBadgeClasses = (status: OrderStatus | null) => {
  switch (status) {
    case 'pending_approval': return 'bg-orange-500/15 text-orange-700 dark:text-orange-300';
    case 'approved': return 'bg-blue-500/15 text-blue-700 dark:text-blue-300';
    case 'in_production': return 'bg-purple-500/15 text-purple-700 dark:text-purple-300';
    case 'dispatched': return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300';
    case 'delivered': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'rejected': return 'bg-red-500/15 text-red-700 dark:text-red-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

const OrderManagement = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load orders', description: error.message, variant: 'destructive' });
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel('order-management-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.order_number.toLowerCase().includes(term) ||
      (order.project_name ?? '').toLowerCase().includes(term) ||
      (order.site_contact_name ?? '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (order: OrderRow, next: OrderStatus, successMessage: string) => {
    setPendingId(order.id);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;

      // Side-effect: when dispatching, create/update delivery record with dispatch_time
      if (next === 'dispatched') {
        const { data: existing } = await supabase
          .from('deliveries')
          .select('id')
          .eq('order_id', order.id)
          .maybeSingle();
        const dispatchPayload = {
          order_id: order.id,
          status: 'dispatched',
          dispatch_time: new Date().toISOString(),
        };
        if (existing?.id) {
          await supabase.from('deliveries').update(dispatchPayload).eq('id', existing.id);
        } else {
          await supabase.from('deliveries').insert(dispatchPayload);
        }
      }

      // Side-effect: on delivered, stamp arrival_time on delivery
      if (next === 'delivered') {
        const { data: existing } = await supabase
          .from('deliveries')
          .select('id')
          .eq('order_id', order.id)
          .maybeSingle();
        const arrivalPayload = {
          order_id: order.id,
          status: 'delivered',
          arrival_time: new Date().toISOString(),
        };
        if (existing?.id) {
          await supabase.from('deliveries').update(arrivalPayload).eq('id', existing.id);
        } else {
          await supabase.from('deliveries').insert(arrivalPayload);
        }
      }

      // Notify the order creator (best-effort)
      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          order_id: order.id,
          title: successMessage,
          message: `Order ${order.order_number} → ${STATUS_LABELS[next]}`,
          type:
            next === 'approved' ? 'order_approved' :
            next === 'dispatched' ? 'truck_dispatched' :
            next === 'delivered' ? 'delivery_confirmed' :
            next === 'rejected' ? 'order_rejected' : 'order_pending',
        });
      }

      toast({ title: successMessage, description: `Order ${order.order_number}` });
      await loadOrders();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setPendingId(null);
    }
  };

  const renderActions = (order: OrderRow) => {
    const isAdmin = role === 'admin';
    const busy = pendingId === order.id;
    const Btn = ({ onClick, icon: Icon, label, variant = 'outline' as const }: any) => (
      <Button size="sm" variant={variant} onClick={onClick} disabled={busy}>
        {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Icon className="w-3 h-3 mr-1" />}
        {label}
      </Button>
    );

    return (
      <div className="flex flex-wrap gap-2">
        {isAdmin && order.status === 'pending_approval' && (
          <>
            <Btn onClick={() => updateStatus(order, 'approved', 'Order approved')} icon={CheckCircle} label="Approve" variant="default" />
            <Btn onClick={() => updateStatus(order, 'rejected', 'Order rejected')} icon={XCircle} label="Reject" />
          </>
        )}
        {isAdmin && order.status === 'approved' && (
          <Btn onClick={() => updateStatus(order, 'in_production', 'Moved to production')} icon={Factory} label="Start Production" variant="default" />
        )}
        {isAdmin && order.status === 'in_production' && (
          <Btn onClick={() => updateStatus(order, 'dispatched', 'Truck dispatched')} icon={Truck} label="Dispatch" variant="default" />
        )}
        {order.status === 'dispatched' && (
          <Btn onClick={() => updateStatus(order, 'delivered', 'Delivery confirmed')} icon={PackageCheck} label="Confirm Delivery" variant="default" />
        )}
        {order.status === 'delivered' && (
          <span className="text-xs text-muted-foreground">Completed {formatDateTime(order.updated_at)}</span>
        )}
        {order.status === 'rejected' && (
          <span className="text-xs text-muted-foreground">Rejected {formatDateTime(order.updated_at)}</span>
        )}
      </div>
    );
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground">Approve, dispatch, and confirm concrete deliveries</p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by order #, project, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No orders match your filters yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Volume / Grade</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.project_name ?? '—'}</p>
                              <p className="text-xs text-muted-foreground">{order.site_contact_name ?? '—'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{Number(order.volume)} m³</p>
                              <p className="text-xs text-muted-foreground">{order.concrete_grade}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.delivery_date}</p>
                              <p className="text-xs text-muted-foreground">{order.delivery_time ?? '—'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadgeClasses(order.status)}>
                              {STATUS_LABELS[order.status ?? 'pending_approval']}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(order.updated_at)}
                          </TableCell>
                          <TableCell>{renderActions(order)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

export default OrderManagement;
