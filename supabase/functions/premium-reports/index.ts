/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  getAuthenticatedUser,
  getProfileByUserId,
  jsonResponse,
} from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  startDate: string;
  endDate: string;
};

function isPremiumActive(profile: any) {
  if (!profile?.premium) return false;
  if (profile?.premium_forever) return true;
  if (!profile?.premium_until) return false;

  return new Date(profile.premium_until).getTime() > Date.now();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(corsHeaders, { error: "Configuração ausente" }, 500);
    }

    const authUser = await getAuthenticatedUser({
      supabaseUrl,
      serviceRoleKey,
      authHeader: req.headers.get("Authorization"),
    });

    if (!authUser?.id) {
      return jsonResponse(corsHeaders, { error: "Não autenticado" }, 401);
    }

    const profile = await getProfileByUserId({
      supabaseUrl,
      serviceRoleKey,
      userId: authUser.id,
    });

    if (!profile) {
      return jsonResponse(corsHeaders, { error: "Perfil não encontrado" }, 404);
    }

    if (profile.is_blocked) {
      return jsonResponse(corsHeaders, { error: "Usuário bloqueado" }, 403);
    }

    if (!isPremiumActive(profile)) {
      return jsonResponse(
        corsHeaders,
        { error: "Recurso disponível apenas para premium" },
        403
      );
    }

    const body = (await req.json()) as RequestBody;
    const { startDate, endDate } = body;

    const [earningsResponse, expensesResponse] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/earnings?user_id=eq.${authUser.id}&date=gte.${startDate}&date=lte.${endDate}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/expenses?user_id=eq.${authUser.id}&date=gte.${startDate}&date=lte.${endDate}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      ),
    ]);

    if (!earningsResponse.ok || !expensesResponse.ok) {
      return jsonResponse(
        corsHeaders,
        { error: "Erro ao carregar dados premium" },
        500
      );
    }

    const earnings = await earningsResponse.json();
    const expenses = await expensesResponse.json();

    const automaticFuelExpenses = earnings
      .map((item: any) => {
        if (
          !item.km_traveled ||
          !item.fuel_efficiency ||
          !item.fuel_price ||
          item.km_traveled <= 0 ||
          item.fuel_efficiency <= 0 ||
          item.fuel_price <= 0
        ) {
          return null;
        }

        return {
          id: `fuel-${item.id}`,
          user_id: item.user_id,
          date: item.date,
          category: "Combustível automático",
          amount: Number(
            ((item.km_traveled / item.fuel_efficiency) * item.fuel_price).toFixed(2)
          ),
          notes: "Calculado automaticamente",
          created_at: item.created_at,
          updated_at: item.updated_at,
          source: "automatic_fuel",
        };
      })
      .filter(Boolean);

    const allExpenses = [
      ...expenses.map((item: any) => ({
        ...item,
        source: "manual",
      })),
      ...automaticFuelExpenses,
    ];

    return jsonResponse(corsHeaders, {
      earnings,
      expenses: allExpenses,
    });
  } catch (error) {
    return jsonResponse(
      corsHeaders,
      {
        error: error instanceof Error ? error.message : "Erro inesperado",
      },
      500
    );
  }
});