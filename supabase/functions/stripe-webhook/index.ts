/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@16.10.0";
import { logPremiumHistory } from "../_shared/auth.ts";

serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !serviceRoleKey) {
      return new Response("Configuração ausente", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Assinatura ausente", { status: 400 });
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const obj: any = event.data.object;
      const userId =
        obj.metadata?.user_id ||
        obj?.items?.data?.[0]?.price?.metadata?.user_id ||
        null;

      const planCode =
        obj.metadata?.plan_code ||
        obj?.items?.data?.[0]?.price?.metadata?.plan_code ||
        "monthly";

      if (userId) {
        const expiresAt =
          obj.current_period_end
            ? new Date(obj.current_period_end * 1000).toISOString()
            : null;

        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            premium: true,
            premium_forever: false,
            premium_until: expiresAt,
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            user_id: userId,
            provider: "stripe",
            provider_customer_id: obj.customer ?? null,
            provider_subscription_id: obj.subscription ?? obj.id ?? null,
            plan_code: planCode,
            status: "active",
            amount: null,
            currency: "BRL",
            started_at: new Date().toISOString(),
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          }),
        });

        await logPremiumHistory({
          supabaseUrl,
          serviceRoleKey,
          userId,
          adminUserId: null,
          action: "subscription_activated",
          oldPremium: false,
          newPremium: true,
          oldPremiumUntil: null,
          newPremiumUntil: expiresAt,
          details: {
            provider: "stripe",
            planCode,
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const obj: any = event.data.object;
      const subscriptionId = obj.id;

      const subscriptionLookup = await fetch(
        `${supabaseUrl}/rest/v1/user_subscriptions?provider_subscription_id=eq.${subscriptionId}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      const subscriptions = await subscriptionLookup.json();
      const subscription = subscriptions?.[0];

      if (subscription?.user_id) {
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${subscription.user_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            premium: false,
            premium_forever: false,
            premium_until: null,
          }),
        });

        await fetch(
          `${supabaseUrl}/rest/v1/user_subscriptions?provider_subscription_id=eq.${subscriptionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              status: "canceled",
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          }
        );

        await logPremiumHistory({
          supabaseUrl,
          serviceRoleKey,
          userId: subscription.user_id,
          adminUserId: null,
          action: "subscription_canceled",
          oldPremium: true,
          newPremium: false,
          oldPremiumUntil: subscription.expires_at ?? null,
          newPremiumUntil: null,
          details: {
            provider: "stripe",
          },
        });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Erro inesperado",
      { status: 400 }
    );
  }
});