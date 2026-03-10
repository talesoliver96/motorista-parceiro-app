import { supabase } from "../../lib/supabase";

type PremiumReportsResponse = {
  earnings: any[];
  expenses: any[];
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

export const reportsProService = {
  async getPremiumReports(startDate: string, endDate: string) {
    const token = await getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/premium-reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        startDate,
        endDate,
      }),
    });

    const data = (await response.json().catch(() => null)) as PremiumReportsResponse | { error?: string } | null;

    if (!response.ok) {
      throw new Error((data as { error?: string } | null)?.error || "Erro ao carregar relatórios premium");
    }

    return data as PremiumReportsResponse;
  },
};