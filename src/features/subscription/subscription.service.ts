import { supabase } from "../../lib/supabase";
import type { UserSubscription } from "../admin/admin.types";

export const subscriptionService = {
  async getCurrentUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return (data ?? null) as UserSubscription | null;
  },
};