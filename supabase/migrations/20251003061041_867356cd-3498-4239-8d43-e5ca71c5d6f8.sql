-- Drop functions that depend on enums
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Update app_role enum to match specification
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('admin', 'site_agent');

-- Update user_roles table to use new enum
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING 
  CASE role::text
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'moderator' THEN 'admin'::app_role
    WHEN 'user' THEN 'site_agent'::app_role
    ELSE 'site_agent'::app_role
  END;
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'site_agent'::app_role;

DROP TYPE app_role_old;

-- Recreate has_role function with new app_role type
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update order_status enum to match specification
ALTER TYPE order_status RENAME TO order_status_old;
CREATE TYPE order_status AS ENUM ('pending_approval', 'approved', 'in_production', 'dispatched', 'delivered', 'rejected');

-- Update orders table to use new enum
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING 
  CASE status::text
    WHEN 'placed' THEN 'pending_approval'::order_status
    WHEN 'confirmed' THEN 'approved'::order_status
    WHEN 'in_production' THEN 'in_production'::order_status
    WHEN 'dispatched' THEN 'dispatched'::order_status
    WHEN 'delivered' THEN 'delivered'::order_status
    WHEN 'cancelled' THEN 'rejected'::order_status
    ELSE 'pending_approval'::order_status
  END;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_approval'::order_status;

DROP TYPE order_status_old;

-- Add additional fields to orders table to match specification
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS project_name TEXT,
  ADD COLUMN IF NOT EXISTS client TEXT DEFAULT 'Internal',
  ADD COLUMN IF NOT EXISTS mix_design TEXT,
  ADD COLUMN IF NOT EXISTS site_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS site_contact_phone TEXT;

-- Update notification_type enum to match specification triggers
ALTER TYPE notification_type RENAME TO notification_type_old;
CREATE TYPE notification_type AS ENUM ('order_approved', 'truck_dispatched', 'delivery_arrived', 'delivery_confirmed', 'order_rejected', 'order_pending');

-- Update notifications table
ALTER TABLE notifications ALTER COLUMN type DROP DEFAULT;
ALTER TABLE notifications ALTER COLUMN type TYPE notification_type USING 
  CASE type::text
    WHEN 'order_placed' THEN 'order_pending'::notification_type
    WHEN 'order_confirmed' THEN 'order_approved'::notification_type
    WHEN 'order_dispatched' THEN 'truck_dispatched'::notification_type
    WHEN 'order_delivered' THEN 'delivery_confirmed'::notification_type
    ELSE 'order_pending'::notification_type
  END;

DROP TYPE notification_type_old;

-- Update handle_new_user to assign site_agent role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Create a new company if company_name is provided
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    INSERT INTO public.companies (name, email, phone)
    VALUES (
      NEW.raw_user_meta_data->>'company_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone'
    )
    RETURNING id INTO new_company_id;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, company_id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    new_company_id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );

  -- Assign default site_agent role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'site_agent');

  RETURN NEW;
END;
$$;