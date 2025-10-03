import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

export interface RealtimeOrder {
  id: string;
  order_number: string;
  status: string;
  volume: number;
  delivery_date: string;
  site_name?: string;
  updated_at: string;
}

export interface RealtimeDelivery {
  id: string;
  order_id: string;
  truck_number: string;
  driver_name: string;
  status: string;
  current_latitude?: number;
  current_longitude?: number;
  eta_minutes?: number;
  updated_at: string;
}

export const useRealtimeOrders = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            volume,
            delivery_date,
            sites(name),
            updated_at
          `)
          .order('updated_at', { ascending: false })
          .limit(10);

        // Apply role-based filtering
        if (role === 'site_agent') {
          // Site agents only see their company's orders
          // This would need to be enhanced with proper company filtering
          query = query.eq('status', 'dispatched');
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedOrders = data?.map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          volume: order.volume,
          delivery_date: order.delivery_date,
          site_name: order.sites?.name,
          updated_at: order.updated_at
        })) || [];

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Record<string, unknown>;
            setOrders(prev => [{
              id: newOrder.id,
              order_number: newOrder.order_number,
              status: newOrder.status,
              volume: newOrder.volume,
              delivery_date: newOrder.delivery_date,
              site_name: newOrder.site_name,
              updated_at: newOrder.updated_at
            }, ...prev.slice(0, 9)]);

            // Send push notification for new orders
            notificationService.sendOrderUpdateNotification({
              orderId: newOrder.order_number,
              status: newOrder.status,
              message: `New order placed: ${newOrder.volume}m³ for ${newOrder.delivery_date}`
            }).catch((err: Error) => console.error(err));
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Record<string, unknown>;
            setOrders(prev => prev.map(order => 
              order.id === updatedOrder.id 
                ? {
                    ...order,
                    status: updatedOrder.status,
                    updated_at: updatedOrder.updated_at
                  }
                : order
            ));

            // Send push notification for status changes
            notificationService.sendOrderUpdateNotification({
              orderId: updatedOrder.order_number,
              status: updatedOrder.status,
              message: `Order status changed to: ${updatedOrder.status}`
            }).catch((err: Error) => console.error(err));
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Record<string, unknown>;
            setOrders(prev => prev.filter(order => order.id !== deletedOrder.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  return { orders, loading };
};

export const useRealtimeDeliveries = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<RealtimeDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch initial deliveries
    const fetchDeliveries = async () => {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select(`
            id,
            order_id,
            truck_number,
            driver_name,
            status,
            current_latitude,
            current_longitude,
            eta_minutes,
            updated_at
          `)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setDeliveries(data || []);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();

    // Set up real-time subscription
    const channel = supabase
      .channel('deliveries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        (payload) => {
          console.log('Delivery change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newDelivery = payload.new as RealtimeDelivery;
            setDeliveries(prev => [newDelivery, ...prev.slice(0, 9)]);

            // Send push notification for new deliveries
            if (newDelivery.eta_minutes && newDelivery.eta_minutes <= 30) {
              notificationService.sendUrgentDeliveryNotification({
                orderId: newDelivery.order_id,
                deliveryId: newDelivery.id,
                eta: `${newDelivery.eta_minutes} minutes`,
                driverName: newDelivery.driver_name || 'Unknown'
              }).catch((err: Error) => console.error(err));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedDelivery = payload.new as RealtimeDelivery;
            setDeliveries(prev => prev.map(delivery => 
              delivery.id === updatedDelivery.id 
                ? { ...delivery, ...updatedDelivery }
                : delivery
            ));

            // Send push notification for urgent delivery updates
            if (updatedDelivery.eta_minutes && updatedDelivery.eta_minutes <= 15) {
              notificationService.sendUrgentDeliveryNotification({
                orderId: updatedDelivery.order_id,
                deliveryId: updatedDelivery.id,
                eta: `${updatedDelivery.eta_minutes} minutes`,
                driverName: updatedDelivery.driver_name || 'Unknown'
              }).catch((err: Error) => console.error(err));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedDelivery = payload.old as RealtimeDelivery;
            setDeliveries(prev => prev.filter(delivery => delivery.id !== deletedDelivery.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { deliveries, loading };
};

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        const notificationsData = data || [];
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        ({ ...notification, is_read: true })
      ));
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  };
};
