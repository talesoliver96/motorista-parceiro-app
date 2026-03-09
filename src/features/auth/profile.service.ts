import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";

export const profileService = {
  async getProfileByUserId(userId: string): Promise<Profile | null> {
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

  async updateProfileByUserId(userId: string, values: { phone: string }) {
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: values.phone,
      })
      .eq("id", userId);

    if (error) throw error;
  },
};