import { supabase } from "@/integrations/supabase/client";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
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
      },
    },
  });

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
