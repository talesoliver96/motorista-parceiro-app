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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
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

    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${auth.user.id}&status=neq.canceled&order=created_at.desc&limit=1&select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!lookup.ok) {
      const text = await lookup.text();
      return jsonResponse(corsHeaders, { error: text }, 500);
    }

    const rows = await lookup.json();
    const current = rows?.[0];

    if (!current?.provider_subscription_id) {
      return jsonResponse(
        corsHeaders,
        { error: "Nenhuma assinatura recorrente ativa encontrada" },
        404
      );
    }

    if (!current.is_auto_renew) {
      return jsonResponse(
        corsHeaders,
        { error: "Este plano não possui renovação automática" },
        400
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const canceled = await stripe.subscriptions.update(
      current.provider_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    await fetch(
      `${supabaseUrl}/rest/v1/user_subscriptions?provider_subscription_id=eq.${current.provider_subscription_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          status: canceled.status,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    return jsonResponse(corsHeaders, {
      success: true,
      message: "Assinatura configurada para cancelamento ao fim do período.",
    });
  } catch (error) {
    return jsonResponse(
      corsHeaders,
      { error: error instanceof Error ? error.message : "Erro inesperado" },
      500
    );
  }
});