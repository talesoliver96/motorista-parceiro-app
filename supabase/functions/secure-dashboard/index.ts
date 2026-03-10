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

    const manualExpenses = expenses.reduce(
      (acc: number, item: any) => acc + Number(item.amount || 0),
      0
    );

    const automaticFuel = isPremiumActive(auth.profile)
      ? earnings.reduce((acc: number, item: any) => {
          if (
            !item.km_traveled ||
            !item.fuel_efficiency ||
            !item.fuel_price ||
            item.km_traveled <= 0 ||
            item.fuel_efficiency <= 0 ||
            item.fuel_price <= 0
          ) {
            return acc;
          }

          return (
            acc +
            (Number(item.km_traveled) / Number(item.fuel_efficiency)) *
              Number(item.fuel_price)
          );
        }, 0)
      : 0;

    const totalExpenses = manualExpenses + automaticFuel;
    const net = gross - totalExpenses;
    const totalKm = earnings.reduce(
      (acc: number, item: any) => acc + Number(item.km_traveled || 0),
      0
    );

    return jsonResponse(corsHeaders, {
      summary: {
        gross: Number(gross.toFixed(2)),
        manualExpenses: Number(manualExpenses.toFixed(2)),
        automaticFuel: Number(automaticFuel.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        net: Number(net.toFixed(2)),
        totalKm: Number(totalKm.toFixed(2)),
        premiumActive: isPremiumActive(auth.profile),
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