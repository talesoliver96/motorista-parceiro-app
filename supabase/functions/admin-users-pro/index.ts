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

type UserListFilter = "all" | "premium" | "free" | "admins" | "blocked";
type AppMode = "driver" | "basic";

type ListActionBody = {
  action: "list";
  search?: string;
  page?: number;
  pageSize?: number;
  filter?: UserListFilter;
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
  appMode: AppMode;
  walletEnabled: boolean;
  walletBalance: number;
};

type DeleteActionBody = {
  action: "delete";
  userId: string;
};

type GetGlobalSettingsActionBody = {
  action: "get_global_settings";
};

type SetNewUserPremiumPolicyActionBody = {
  action: "set_new_user_premium_policy";
  enabled: boolean;
  durationDays: number;
};

type ApplyPremiumToAllActionBody = {
  action: "apply_premium_to_all";
  durationDays: number;
};

type RevokePremiumFromAllActionBody = {
  action: "revoke_premium_from_all";
};

type ResetSystemDataActionBody = {
  action: "reset_system_data";
};

type ClearAllNonAdminUsersActionBody = {
  action: "clear_all_non_admin_users";
};

type RequestBody =
  | ListActionBody
  | UpdateActionBody
  | DeleteActionBody
  | GetGlobalSettingsActionBody
  | SetNewUserPremiumPolicyActionBody
  | ApplyPremiumToAllActionBody
  | RevokePremiumFromAllActionBody
  | ResetSystemDataActionBody
  | ClearAllNonAdminUsersActionBody;

type MergedUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  premium: boolean;
  premium_forever: boolean;
  premium_until: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  app_mode: AppMode;
  wallet_enabled: boolean;
  wallet_balance: number;
  created_at: string | null;
  last_sign_in_at: string | null;
};

async function fetchAllAuthUsers(
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<any[]> {
  const perPage = 200;
  let page = 1;
  const allUsers: any[] = [];

  while (true) {
    const usersResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      throw new Error(errorText || "Erro ao buscar usuários auth");
    }

    const usersData = await usersResponse.json();
    const users = Array.isArray(usersData?.users) ? usersData.users : [];

    allUsers.push(...users);

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return allUsers;
}

async function fetchAllProfiles(
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<any[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao buscar perfis");
  }

  return await response.json();
}

function matchesFilter(user: MergedUser, filter: UserListFilter) {
  switch (filter) {
    case "premium":
      return user.premium;
    case "free":
      return !user.premium;
    case "admins":
      return user.is_admin;
    case "blocked":
      return user.is_blocked;
    default:
      return true;
  }
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
      const filter = body.filter ?? "all";
      const page = Math.max(1, Number(body.page ?? 1));
      const pageSize = Math.max(1, Math.min(100, Number(body.pageSize ?? 10)));

      const [users, profiles] = await Promise.all([
        fetchAllAuthUsers(supabaseUrl, serviceRoleKey),
        fetchAllProfiles(supabaseUrl, serviceRoleKey),
      ]);

      const profilesMap = new Map(
        profiles.map((profile: any) => [profile.id, profile])
      );

      const merged: MergedUser[] = users
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
            app_mode: profile?.app_mode === "basic" ? "basic" : "driver",
            wallet_enabled: Boolean(profile?.wallet_enabled),
            wallet_balance: Number(profile?.wallet_balance ?? 0),
            created_at: user.created_at ?? null,
            last_sign_in_at: user.last_sign_in_at ?? null,
          };
        })
        .filter((item) => {
          if (search) {
            const email = item.email.toLowerCase();
            const name = item.name.toLowerCase();
            const phone = item.phone?.toLowerCase() ?? "";

            const matchesSearch =
              email.includes(search) ||
              name.includes(search) ||
              phone.includes(search);

            if (!matchesSearch) {
              return false;
            }
          }

          return matchesFilter(item, filter);
        })
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

      const total = merged.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      const from = (safePage - 1) * pageSize;
      const to = from + pageSize;
      const paginatedUsers = merged.slice(from, to);

      return jsonResponse(corsHeaders, {
        users: paginatedUsers,
        total,
        page: safePage,
        pageSize,
        totalPages,
      });
    }

    if (body.action === "get_global_settings") {
      const settingsResponse = await fetch(
        `${supabaseUrl}/rest/v1/app_settings?key=eq.new_user_premium_policy&select=*`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!settingsResponse.ok) {
        const errorText = await settingsResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      const settingsData = await settingsResponse.json();
      const setting = settingsData?.[0];

      return jsonResponse(corsHeaders, {
        policy: {
          enabled: Boolean(setting?.value?.enabled),
          durationDays: Number(setting?.value?.duration_days ?? 365),
        },
      });
    }

    if (body.action === "set_new_user_premium_policy") {
      const { enabled, durationDays } = body;

      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/app_settings?key=eq.new_user_premium_policy`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            value: {
              enabled,
              duration_days: durationDays,
            },
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        action: "set_new_user_premium_policy",
        details: {
          enabled,
          durationDays,
        },
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    if (body.action === "apply_premium_to_all") {
      const { durationDays } = body;

      const usersResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id,is_admin`,
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

      const profiles = await usersResponse.json();
      const targetProfiles = profiles.filter((item: any) => !item.is_admin);

      for (const profile of targetProfiles) {
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + durationDays);

        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            premium: true,
            premium_forever: false,
            premium_until: premiumUntil.toISOString(),
          }),
        });
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        action: "apply_premium_to_all",
        details: {
          durationDays,
        },
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    if (body.action === "revoke_premium_from_all") {
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?is_admin=eq.false`,
        {
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
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        return jsonResponse(corsHeaders, { error: errorText }, 500);
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        action: "revoke_premium_from_all",
        details: {},
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    if (body.action === "reset_system_data") {
      await fetch(`${supabaseUrl}/rest/v1/earnings?id=not.is.null`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/expenses?id=not.is.null`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/contact_messages?id=not.is.null`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await fetch(`${supabaseUrl}/rest/v1/admin_actions?id=not.is.null`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        action: "reset_system_data",
        details: {},
      });

      return jsonResponse(corsHeaders, { success: true });
    }

    if (body.action === "clear_all_non_admin_users") {
      const profilesResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id,is_admin`,
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
      const targetProfiles = profiles.filter((item: any) => !item.is_admin);

      for (const profile of targetProfiles) {
        const userId = profile.id;

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

        await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
      }

      await logAdminAction({
        supabaseUrl,
        serviceRoleKey,
        adminUserId: adminAuth.user.id,
        action: "clear_all_non_admin_users",
        details: {},
      });

      return jsonResponse(corsHeaders, { success: true });
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
        appMode,
        walletEnabled,
        walletBalance,
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
            app_mode: appMode,
            wallet_enabled: walletEnabled,
            wallet_balance: Number(walletBalance ?? 0),
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
          appMode,
          walletEnabled,
          walletBalance: Number(walletBalance ?? 0),
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