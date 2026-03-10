import type { PublicAppSettings } from "../admin/admin.types";

export const publicSettingsService = {
  async getSettings(): Promise<PublicAppSettings> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/public-app-settings`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao carregar configurações públicas");
    }

    return data as PublicAppSettings;
  },
};