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

type PlanCode = "monthly" | "quarterly" | "semiannual" | "annual";
type PaymentFlow = "card_subscription" | "pix_one_time";

type RequestBody = {
  planCode: PlanCode;
  paymentFlow: PaymentFlow;
};

const planDaysMap: Record<PlanCode, number> = {
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
  annual: 365,
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
    const { planCode, paymentFlow } = body;

    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?key=eq.premium_pricing&select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!settingsResponse.ok) {
      return jsonResponse(corsHeaders, { error: "Erro ao carregar preços" }, 500);
    }

    const settings = await settingsResponse.json();
    const pricing = settings?.[0]?.value ?? {};

    const recurringPriceMap: Record<PlanCode, string> = {
      monthly: String(pricing?.stripe_price_monthly ?? ""),
      quarterly: String(pricing?.stripe_price_quarterly ?? ""),
      semiannual: String(pricing?.stripe_price_semiannual ?? ""),
      annual: String(pricing?.stripe_price_annual ?? ""),
    };

    const amountMap: Record<PlanCode, number> = {
      monthly: Number(pricing?.monthly_price ?? 8),
      quarterly: Number(pricing?.quarterly_price ?? 15),
      semiannual: Number(pricing?.semiannual_price ?? 26),
      annual: Number(pricing?.annual_price ?? 47),
    };

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    if (paymentFlow === "card_subscription") {
      const priceId = recurringPriceMap[planCode];

      if (!priceId) {
        return jsonResponse(
          corsHeaders,
          { error: "Preço Stripe do plano não configurado" },
          400
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: auth.user.email,
        success_url: `${appUrl}/subscription?success=1&flow=card`,
        cancel_url: `${appUrl}/subscription?canceled=1&flow=card`,
        metadata: {
          user_id: auth.user.id,
          plan_code: planCode,
          payment_flow: paymentFlow,
        },
        subscription_data: {
          metadata: {
            user_id: auth.user.id,
            plan_code: planCode,
            payment_flow: paymentFlow,
          },
        },
      });

      return jsonResponse(corsHeaders, { url: session.url });
    }

    if (paymentFlow === "pix_one_time") {
      const amount = amountMap[planCode];

      if (!amount || amount <= 0) {
        return jsonResponse(
          corsHeaders,
          { error: "Preço do plano não configurado" },
          400
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["pix"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: `Premium ${planCode} via Pix`,
                description: `Acesso premium por ${planDaysMap[planCode]} dias`,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: auth.user.email,
        success_url: `${appUrl}/subscription?success=1&flow=pix`,
        cancel_url: `${appUrl}/subscription?canceled=1&flow=pix`,
        metadata: {
          user_id: auth.user.id,
          plan_code: planCode,
          payment_flow: paymentFlow,
          premium_days: String(planDaysMap[planCode]),
        },
      });

      return jsonResponse(corsHeaders, { url: session.url });
    }

    return jsonResponse(corsHeaders, { error: "Fluxo inválido" }, 400);
  } catch (error) {
    return jsonResponse(
      corsHeaders,
      { error: error instanceof Error ? error.message : "Erro inesperado" },
      500
    );
  }
});