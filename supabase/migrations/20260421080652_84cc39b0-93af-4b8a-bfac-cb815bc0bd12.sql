-- Deliveries: allow company users to insert/update/delete deliveries for their company's orders
CREATE POLICY "Users can create company deliveries"
  ON public.deliveries
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.company_id IN (
        SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update company deliveries"
  ON public.deliveries
  FOR UPDATE
  USING (
    order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.company_id IN (
        SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete company deliveries"
  ON public.deliveries
  FOR DELETE
  USING (
    order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.company_id IN (
        SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()
      )
    )
  );

-- Notifications: allow inserting notifications for self
CREATE POLICY "Users can create own notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());