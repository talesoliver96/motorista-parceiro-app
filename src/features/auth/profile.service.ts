import { supabase } from "../../lib/supabase";
import type { AppMode, Profile } from "../../types/database";

type UpdateProfilePayload = {
  phone: string;
  appMode?: AppMode;
  walletEnabled?: boolean;
  walletBalance?: number;
};

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

  async updateProfileByUserId(userId: string, values: UpdateProfilePayload) {
    const payload: {
      phone: string;
      app_mode?: AppMode;
      wallet_enabled?: boolean;
      wallet_balance?: number;
    } = {
      phone: values.phone,
    };

    if (values.appMode !== undefined) {
      payload.app_mode = values.appMode;
    }

    if (values.walletEnabled !== undefined) {
      payload.wallet_enabled = values.walletEnabled;
    }

    if (values.walletBalance !== undefined) {
      payload.wallet_balance = values.walletBalance;
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (error) throw error;
  },
};