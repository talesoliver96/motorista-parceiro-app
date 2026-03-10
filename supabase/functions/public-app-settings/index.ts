/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Configuração ausente" }, 500);
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return jsonResponse({ error: text }, 500);
    }

    const rows = await response.json();
    const map = new Map(rows.map((item: any) => [item.key, item.value]));

    return jsonResponse({
      subscriptionMode: {
        enabled: Boolean(map.get("subscription_mode")?.enabled),
      },
      maintenanceMode: {
        enabled: Boolean(map.get("maintenance_mode")?.enabled),
        message:
          map.get("maintenance_mode")?.message ||
          "Estamos em manutenção no momento. Tente novamente em instantes.",
      },
      premiumPricing: {
        monthlyPrice: Number(map.get("premium_pricing")?.monthly_price ?? 5),
        quarterlyPrice: Number(map.get("premium_pricing")?.quarterly_price ?? 12),
        semiannualPrice: Number(map.get("premium_pricing")?.semiannual_price ?? 22),
        annualPrice: Number(map.get("premium_pricing")?.annual_price ?? 40),
        stripePriceMonthly: String(map.get("premium_pricing")?.stripe_price_monthly ?? ""),
        stripePriceQuarterly: String(map.get("premium_pricing")?.stripe_price_quarterly ?? ""),
        stripePriceSemiannual: String(map.get("premium_pricing")?.stripe_price_semiannual ?? ""),
        stripePriceAnnual: String(map.get("premium_pricing")?.stripe_price_annual ?? ""),
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro inesperado" },
      500
    );
  }
});