-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.structures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Set replica identity to full for complete row data
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.deliveries REPLICA IDENTITY FULL;
ALTER TABLE public.sites REPLICA IDENTITY FULL;
ALTER TABLE public.structures REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;