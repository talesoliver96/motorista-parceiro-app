import { supabase } from "../../lib/supabase";

export type SecureDashboardSummary = {
  gross: number;
  manualExpenses: number;
  automaticFuel: number;
  totalExpenses: number;
  net: number;
  totalKm: number;
  premiumActive: boolean;
};

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  return token;
}

export const secureDashboardService = {
  async getSummary(startDate: string, endDate: string) {
    const token = await getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/secure-dashboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ startDate, endDate }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao carregar dashboard seguro");
    }

    return data?.summary as SecureDashboardSummary;
  },
};