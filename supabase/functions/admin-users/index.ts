/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
};

type RequestBody = ListActionBody | UpdateActionBody;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function getAuthenticatedUser(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  authHeader: string | null;
}) {
  if (!params.authHeader) {
    return null;
  }

  const token = params.authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  const response = await fetch(`${params.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: params.serviceRoleKey,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

async function checkIfUserIsAdmin(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string;
}) {
  const response = await fetch(
    `${params.supabaseUrl}/rest/v1/profiles?id=eq.${params.userId}&select=is_admin`,
    {
      headers: {
        apikey: params.serviceRoleKey,
        Authorization: `Bearer ${params.serviceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return Boolean(data?.[0]?.is_admin);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Configuração do Supabase ausente" }, 500);
    }

    const authUser = await getAuthenticatedUser({
      supabaseUrl,
      serviceRoleKey,
      authHeader: req.headers.get("Authorization"),
    });

    if (!authUser?.id) {
      return jsonResponse({ error: "Não autenticado" }, 401);
    }

    const isAdmin = await checkIfUserIsAdmin({
      supabaseUrl,
      serviceRoleKey,
      userId: authUser.id,
    });

    if (!isAdmin) {
      return jsonResponse({ error: "Acesso negado" }, 403);
    }

    const body = (await req.json()) as RequestBody;

    if (body.action === "list") {
      const search = body.search?.trim().toLowerCase() ?? "";

      const usersResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=200`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        return jsonResponse({ error: errorText }, 500);
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
        return jsonResponse({ error: errorText }, 500);
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

      return jsonResponse({ users: merged });
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
        return jsonResponse({ error: errorText }, 500);
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
          }),
        }
      );

      if (!profileUpdateResponse.ok) {
        const errorText = await profileUpdateResponse.text();
        return jsonResponse({ error: errorText }, 500);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Ação inválida" }, 400);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Erro inesperado",
      },
      500
    );
  }
});