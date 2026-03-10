/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  assertAuthenticatedActiveUser,
  isPremiumActive,
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

function isFuelExpenseCategory(category: string) {
  const normalized = String(category ?? "").trim().toLowerCase();
  return normalized === "combustível" || normalized === "combustivel";
}

function getAutomaticFuelCost(item: any) {
  if (!item.auto_fuel_enabled) return null;

  if (
    !item.km_traveled ||
    !item.fuel_efficiency ||
    !item.fuel_price ||
    Number(item.km_traveled) <= 0 ||
    Number(item.fuel_efficiency) <= 0 ||
    Number(item.fuel_price) <= 0
  ) {
    return null;
  }

  return (Number(item.km_traveled) / Number(item.fuel_efficiency)) * Number(item.fuel_price);
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

    const auth = await assertAuthenticatedActiveUser({
      supabaseUrl,
      serviceRoleKey,
      authHeader: req.headers.get("Authorization"),
    });

    if (!auth.ok || !auth.user || !auth.profile) {
      return jsonResponse(corsHeaders, { error: auth.error }, auth.status);
    }

    const body = (await req.json()) as RequestBody;
    const { startDate, endDate } = body;

    const [earningsResponse, expensesResponse] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/earnings?user_id=eq.${auth.user.id}&date=gte.${startDate}&date=lte.${endDate}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/expenses?user_id=eq.${auth.user.id}&date=gte.${startDate}&date=lte.${endDate}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      ),
    ]);

    if (!earningsResponse.ok || !expensesResponse.ok) {
      return jsonResponse(corsHeaders, { error: "Erro ao carregar dashboard" }, 500);
    }

    const earnings = await earningsResponse.json();
    const expenses = await expensesResponse.json();

    const gross = earnings.reduce(
      (acc: number, item: any) => acc + Number(item.gross_amount || 0),
      0
    );

    const premiumActive = isPremiumActive(auth.profile);

    const automaticDrafts = premiumActive
      ? earnings
          .map((item: any) => {
            const cost = getAutomaticFuelCost(item);

            if (!cost) return null;

            return {
              date: item.date,
              created_at: item.created_at,
              remaining_amount: Number(cost.toFixed(2)),
            };
          })
          .filter((item: any) => item !== null)
          .sort((a: any, b: any) => {
            if (a.date === b.date) {
              return String(a.created_at).localeCompare(String(b.created_at));
            }

            return String(a.date).localeCompare(String(b.date));
          })
      : [];

    const sortedExpenses = [...expenses].sort((a: any, b: any) => {
      if (a.date === b.date) {
        return String(a.created_at).localeCompare(String(b.created_at));
      }

      return String(a.date).localeCompare(String(b.date));
    });

    let manualExpenses = 0;

    for (const expense of sortedExpenses) {
      const originalAmount = Number(expense.amount || 0);
      let effectiveAmount = originalAmount;

      if (
        premiumActive &&
        expense.compensate_automatic_fuel &&
        isFuelExpenseCategory(expense.category)
      ) {
        for (const automatic of automaticDrafts) {
          if (effectiveAmount <= 0) break;
          if (automatic.remaining_amount <= 0) continue;

          const used = Math.min(effectiveAmount, automatic.remaining_amount);

          automatic.remaining_amount = Number(
            (automatic.remaining_amount - used).toFixed(2)
          );
          effectiveAmount = Number((effectiveAmount - used).toFixed(2));
        }
      }

      manualExpenses = Number((manualExpenses + effectiveAmount).toFixed(2));
    }

    const automaticFuel = Number(
      automaticDrafts
        .reduce(
          (acc: number, item: any) => acc + Number(item.remaining_amount || 0),
          0
        )
        .toFixed(2)
    );

    const totalExpenses = Number((manualExpenses + automaticFuel).toFixed(2));
    const net = Number((gross - totalExpenses).toFixed(2));

    const totalKm = earnings.reduce(
      (acc: number, item: any) => acc + Number(item.km_traveled || 0),
      0
    );

    return jsonResponse(corsHeaders, {
      summary: {
        gross: Number(gross.toFixed(2)),
        manualExpenses: Number(manualExpenses.toFixed(2)),
        automaticFuel,
        totalExpenses,
        net,
        totalKm: Number(totalKm.toFixed(2)),
        premiumActive,
      },
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