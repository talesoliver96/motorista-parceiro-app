/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@16.10.0";
import { assertAuthenticatedActiveUser, jsonResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  planCode: "monthly" | "quarterly" | "semiannual" | "annual";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const appUrl = Deno.env.get("APP_URL");

    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey || !appUrl) {
      return jsonResponse(corsHeaders, { error: "Configuração ausente" }, 500);
    }

    const auth = await assertAuthenticatedActiveUser({
      supabaseUrl,
      serviceRoleKey,
      authHeader: req.headers.get("Authorization"),
    });

    if (!auth.ok || !auth.user) {
      return jsonResponse(corsHeaders, { error: auth.error }, auth.status);
    }

    const body = (await req.json()) as RequestBody;
    const planCode = body.planCode;

    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?key=eq.premium_pricing&select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const settings = await settingsResponse.json();
    const pricing = settings?.[0]?.value ?? {};

    const priceMap: Record<string, string> = {
      monthly: pricing?.stripe_price_monthly || "",
      quarterly: pricing?.stripe_price_quarterly || "",
      semiannual: pricing?.stripe_price_semiannual || "",
      annual: pricing?.stripe_price_annual || "",
    };

    const priceId = priceMap[planCode];

    if (!priceId) {
      return jsonResponse(corsHeaders, { error: "Preço Stripe não configurado para este plano" }, 400);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: auth.user.email,
      success_url: `${appUrl}/subscription?success=1`,
      cancel_url: `${appUrl}/subscription?canceled=1`,
      metadata: {
        user_id: auth.user.id,
        plan_code: planCode,
      },
    });

    return jsonResponse(corsHeaders, {
      url: session.url,
    });
  } catch (error) {
    return jsonResponse(
      corsHeaders,
      { error: error instanceof Error ? error.message : "Erro inesperado" },
      500
    );
  }
});