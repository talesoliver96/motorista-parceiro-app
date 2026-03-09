import { supabase } from "../../lib/supabase";
import type { LoginFormData, RegisterFormData } from "./auth.schemas";

export const authService = {
  async signUp(data: RegisterFormData) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    });

    if (error) throw error;
  },

  async signIn(data: LoginFormData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
  },

  async updateEmail(email: string) {
    const { error } = await supabase.auth.updateUser({
      email,
    });

    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  },

  onAuthStateChange(
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },
};