import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          // Invalidate orders queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    // Subscribe to deliveries changes
    const deliveriesChannel = supabase
      .channel('deliveries-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['deliveries'] });
        }
      )
      .subscribe();

    // Subscribe to sites changes
    const sitesChannel = supabase
      .channel('sites-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sites'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sites'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(deliveriesChannel);
      supabase.removeChannel(sitesChannel);
    };
  }, [queryClient]);
};
