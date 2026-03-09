import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";

export const profileService = {
  async getMyProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao carregar profile:", error);
      return null;
    }

    return data as Profile;
  },

  async updateMyProfile(values: { phone: string }) {
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: values.phone,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  },
};