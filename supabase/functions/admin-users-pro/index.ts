/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  assertAdmin,
  jsonResponse,
  logAdminAction,
} from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ListActionBody = {
  action: "list";
  search?: string;
};

type UpdateActionBody = {
  action: "update";
  userId: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  premiumMode: "free" | "days" | "until_date";
  premiumDays?: number;
  premiumUntil?: string;
  isAdmin: boolean;
  isBlocked: boolean;
};

type DeleteActionBody = {
  action: "delete";
  userId: string;
};

type RequestBody = ListActionBody | UpdateActionBody | DeleteActionBody;

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

    const adminAuth = await assertAdmin({
      supabaseUrl,
      serviceRoleKey,
      authHeader: req.headers.get("Authorization"),
    });

    if (!adminAuth.ok || !adminAuth.user) {
      return jsonResponse(
        corsHeaders,
        { error: adminAuth.error },
        adminAuth.status
      );
    }

    const body = (await req.json()) as RequestBody;

    if (body.action === "list") {
      const search = body.search?.trim().toLowerCase() ?? "";

      const usersResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=500`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      const usersData = await usersResponse.json();
      const users = usersData?.users ?? [];

      const profilesResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!profilesResponse.ok) {
        const errorText = await profilesResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      const profiles = await profilesResponse.json();

      const profilesMap = new Map(
        profiles.map((profile: any) => [profile.id, profile])
      );

      const merged = users
        .map((user: any) => {
          const profile = profilesMap.get(user.id);

          return {
            id: user.id,
            email: user.email ?? "",
            name: profile?.name ?? "",
            phone: profile?.phone ?? null,
            premium: Boolean(profile?.premium),
            premium_forever: Boolean(profile?.premium_forever),
            premium_until: profile?.premium_until ?? null,
            is_admin: Boolean(profile?.is_admin),
            is_blocked: Boolean(profile?.is_blocked),
            created_at: user.created_at ?? null,
            last_sign_in_at: user.last_sign_in_at ?? null,
          };
        })
        .filter((item: any) => {
          if (!search) return true;

          return (
            item.email.toLowerCase().includes(search) ||
            item.name.toLowerCase().includes(search)
          );
        })
        .sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

      return jsonResponse(corsHeaders, { users: merged });
    }

    if (body.action === "update") {
      const {
        userId,
        name,
        phone,
        email,
        password,
        premiumMode,
        premiumDays,
        premiumUntil,
        isAdmin,
        isBlocked,
      } = body;

      const updateAuthPayload: Record<string, unknown> = {
        email,
      };

      if (password?.trim()) {
        updateAuthPayload.password = password.trim();
      }

      const updateUserResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify(updateAuthPayload),
        }
      );

      if (!updateUserResponse.ok) {
        const errorText = await updateUserResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      let premium = false;
      let premium_forever = false;
      let premium_until: string | null = null;

      if (premiumMode === "days") {
        premium = true;
        const days = Number(premiumDays ?? 0);
        const date = new Date();
        date.setDate(date.getDate() + days);
        premium_until = date.toISOString();
      }

      if (premiumMode === "until_date") {
        premium = true;
        premium_until = premiumUntil
          ? new Date(`${premiumUntil}T23:59:59`).toISOString()
          : null;
      }

      const profileUpdateResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            name,
            phone: phone || null,
            premium,
            premium_forever,
            premium_until,
            is_admin: isAdmin,
            is_blocked: isBlocked,
          }),
        }
      );

      if (!profileUpdateResponse.ok) {
        const errorText = await profileUpdateResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        targetUserId: userId,
        action: "update_user",
        details: {
          name,
          email,
          phone,
          premiumMode,
          premiumDays: premiumDays ?? null,
          premiumUntil: premiumUntil ?? null,
          isAdmin,
          isBlocked,
          passwordChanged: Boolean(password?.trim()),
        },
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    if (body.action === "delete") {
      const { userId } = body;

      await fetch(`${supabaseUrl}/rest/v1/contact_messages?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/earnings?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/expenses?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      const deleteUserResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!deleteUserResponse.ok) {
        const errorText = await deleteUserResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        targetUserId: userId,
        action: "delete_user",
        details: {},
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    return jsonResponse(corsHeaders, { error: "Ação inválida" }, 400);
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