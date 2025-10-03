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
  const redirectUrl = `${window.location.origin}/`;
  
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

  // If signup is successful, create user profile and role
  if (authData.user && !error) {
    try {
      // Create user profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        company_id: null, // Will be set later by admin
      });

      // Create user role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: data.role || 'site_agent',
      });
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { data: authData, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
