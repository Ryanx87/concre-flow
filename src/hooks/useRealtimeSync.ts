import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeSyncStatus {
  connected: boolean;
  lastSync: Date | null;
  syncCount: number;
}

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<RealtimeSyncStatus>({
    connected: false,
    lastSync: null,
    syncCount: 0
  });

  const updateSyncStatus = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      lastSync: new Date(),
      syncCount: prev.syncCount + 1
    }));
  }, []);

  const showSyncNotification = useCallback((table: string, event: string) => {
    toast({
      title: "Data updated",
      description: `${table} ${event} in real-time`,
      duration: 2000,
    });
  }, [toast]);

  useEffect(() => {
    // Single channel for all subscriptions
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders change:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          updateSyncStatus();
          showSyncNotification('Order', payload.eventType);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        (payload) => {
          console.log('Deliveries change:', payload);
          queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          updateSyncStatus();
          showSyncNotification('Delivery', payload.eventType);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sites'
        },
        (payload) => {
          console.log('Sites change:', payload);
          queryClient.invalidateQueries({ queryKey: ['sites'] });
          updateSyncStatus();
          showSyncNotification('Site', payload.eventType);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'structures'
        },
        (payload) => {
          console.log('Structures change:', payload);
          queryClient.invalidateQueries({ queryKey: ['structures'] });
          updateSyncStatus();
          showSyncNotification('Structure', payload.eventType);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notifications change:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          updateSyncStatus();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setStatus(prev => ({
          ...prev,
          connected: status === 'SUBSCRIBED'
        }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, updateSyncStatus, showSyncNotification]);

  return status;
};
