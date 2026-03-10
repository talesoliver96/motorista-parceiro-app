/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@16.10.0";
import { logPremiumHistory } from "../_shared/auth.ts";

async function updateProfilePremium(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string;
  premium: boolean;
  premiumUntil: string | null;
}) {
  const response = await fetch(
    `${params.supabaseUrl}/rest/v1/profiles?id=eq.${params.userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: params.serviceRoleKey,
        Authorization: `Bearer ${params.serviceRoleKey}`,
      },
      body: JSON.stringify({
        premium: params.premium,
        premium_forever: false,
        premium_until: params.premiumUntil,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao atualizar profiles: ${text}`);
  }
}

async function upsertSubscription(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string;
  customerId: string | null;
  subscriptionId: string;
  planCode: string;
  status: string;
  expiresAt: string | null;
  isAutoRenew: boolean;
}) {
  const response = await fetch(`${params.supabaseUrl}/rest/v1/user_subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: params.serviceRoleKey,
      Authorization: `Bearer ${params.serviceRoleKey}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: params.userId,
      provider: "stripe",
      provider_customer_id: params.customerId,
      provider_subscription_id: params.subscriptionId,
      plan_code: params.planCode,
      status: params.status,
      currency: "BRL",
      started_at: new Date().toISOString(),
      expires_at: params.expiresAt,
      is_auto_renew: params.isAutoRenew,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao salvar user_subscriptions: ${text}`);
  }
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

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

    // =========================================
    // PIX (pagamento único)
    // =========================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentFlow = session.metadata?.payment_flow;
      const userId = session.metadata?.user_id;
      const planCode = session.metadata?.plan_code ?? "monthly";

      if (paymentFlow === "pix_one_time" && userId && session.payment_status === "paid") {
        const premiumDays = Number(session.metadata?.premium_days ?? 30);
        const premiumUntil = addDaysIso(premiumDays);

        await updateProfilePremium({
          supabaseUrl,
          serviceRoleKey,
          userId,
          premium: true,
          premiumUntil,
        });

        await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            user_id: userId,
            provider: "stripe",
            provider_customer_id: session.customer ?? null,
            provider_subscription_id: session.id,
            plan_code: `${planCode}_pix`,
            status: "active",
            amount: session.amount_total ? session.amount_total / 100 : null,
            currency: (session.currency || "brl").toUpperCase(),
            started_at: new Date().toISOString(),
            expires_at: premiumUntil,
            is_auto_renew: false,
            updated_at: new Date().toISOString(),
          }),
        });

        await logPremiumHistory({
          supabaseUrl,
          serviceRoleKey,
          userId,
          adminUserId: null,
          action: "pix_payment_approved",
          oldPremium: false,
          newPremium: true,
          oldPremiumUntil: null,
          newPremiumUntil: premiumUntil,
          details: {
            provider: "stripe",
            flow: "pix_one_time",
            planCode,
          },
        });
      }

      // =========================================
      // CARTÃO - usando checkout.session.completed
      // como gatilho principal e buscando a subscription
      // completa na Stripe
      // =========================================
      if (paymentFlow === "card_subscription" && userId && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const premiumUntil = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await updateProfilePremium({
          supabaseUrl,
          serviceRoleKey,
          userId,
          premium: true,
          premiumUntil,
        });

        await upsertSubscription({
          supabaseUrl,
          serviceRoleKey,
          userId,
          customerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null,
          subscriptionId: subscription.id,
          planCode,
          status: subscription.status,
          expiresAt: premiumUntil,
          isAutoRenew: true,
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
          newPremiumUntil: premiumUntil,
          details: {
            provider: "stripe",
            flow: "card_subscription",
            planCode,
          },
        });
      }
    }

    // =========================================
    // CARTÃO - reforço em updates da assinatura
    // =========================================
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const rawSubscription = event.data.object as Stripe.Subscription;

      const subscription = await stripe.subscriptions.retrieve(rawSubscription.id);

      const userId = subscription.metadata?.user_id;
      const planCode = subscription.metadata?.plan_code ?? "monthly";

      if (userId) {
        const premiumUntil = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await updateProfilePremium({
          supabaseUrl,
          serviceRoleKey,
          userId,
          premium: true,
          premiumUntil,
        });

        await upsertSubscription({
          supabaseUrl,
          serviceRoleKey,
          userId,
          customerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null,
          subscriptionId: subscription.id,
          planCode,
          status: subscription.status,
          expiresAt: premiumUntil,
          isAutoRenew: true,
        });

        await logPremiumHistory({
          supabaseUrl,
          serviceRoleKey,
          userId,
          adminUserId: null,
          action: "subscription_updated",
          oldPremium: true,
          newPremium: true,
          oldPremiumUntil: null,
          newPremiumUntil: premiumUntil,
          details: {
            provider: "stripe",
            flow: "card_subscription",
            planCode,
            status: subscription.status,
          },
        });
      }
    }

    // =========================================
    // CANCELAMENTO DE ASSINATURA
    // =========================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      const lookup = await fetch(
        `${supabaseUrl}/rest/v1/user_subscriptions?provider_subscription_id=eq.${subscriptionId}&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      const rows = await lookup.json();
      const existing = rows?.[0];

      if (existing?.user_id) {
        await updateProfilePremium({
          supabaseUrl,
          serviceRoleKey,
          userId: existing.user_id,
          premium: false,
          premiumUntil: null,
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
          userId: existing.user_id,
          adminUserId: null,
          action: "subscription_canceled",
          oldPremium: true,
          newPremium: false,
          oldPremiumUntil: existing.expires_at ?? null,
          newPremiumUntil: null,
          details: {
            provider: "stripe",
            flow: "card_subscription",
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