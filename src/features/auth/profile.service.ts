import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";

export const profileService = {
  async getMyProfile(): Promise<Profile | null> {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as Profile | null) ?? null;
  },

  async updateMyProfile(values: { phone: string }) {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        phone: values.phone,
      })
      .eq("id", userId);

    if (error) throw error;
  },
};