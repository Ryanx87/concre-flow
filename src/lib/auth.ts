import { supabase } from "@/integrations/supabase/client";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  role?: 'admin' | 'site_agent';
}

export const signUp = async (data: SignUpData) => {
  const redirectUrl = `${window.location.origin}/dashboard`;

  // The handle_new_user trigger will automatically create the profile,
  // company (if company_name provided), and user_role from raw_user_meta_data.
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        company_name: data.companyName,
        phone: data.phone,
        role: data.role || 'site_agent',
      },
    },
  });

  // If a non-default role was requested, update it after the trigger runs.
  if (authData.user && !error && data.role && data.role !== 'site_agent') {
    await supabase
      .from('user_roles')
      .update({ role: data.role })
      .eq('user_id', authData.user.id);
  }

  return { data: authData, error };
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};
