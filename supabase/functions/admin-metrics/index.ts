/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  assertAdmin,
  jsonResponse,
} from "../_shared/auth.ts";

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

    if (!adminAuth.ok) {
      return jsonResponse(
        corsHeaders,
        { error: adminAuth.error },
        adminAuth.status
      );
    }

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

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const recentLoginThreshold = new Date(now);
    recentLoginThreshold.setDate(recentLoginThreshold.getDate() - 7);

    const metrics = {
      totalUsers: users.length,
      premiumUsers: profiles.filter((item: any) => item.premium === true).length,
      adminUsers: profiles.filter((item: any) => item.is_admin === true).length,
      blockedUsers: profiles.filter((item: any) => item.is_blocked === true).length,
      usersCreatedToday: users.filter((item: any) => {
        if (!item.created_at) return false;
        return new Date(item.created_at) >= todayStart;
      }).length,
      usersCreatedLast7Days: users.filter((item: any) => {
        if (!item.created_at) return false;
        return new Date(item.created_at) >= last7Days;
      }).length,
      usersLoggedRecently: users.filter((item: any) => {
        if (!item.last_sign_in_at) return false;
        return new Date(item.last_sign_in_at) >= recentLoginThreshold;
      }).length,
    };

    return jsonResponse(corsHeaders, { metrics });
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