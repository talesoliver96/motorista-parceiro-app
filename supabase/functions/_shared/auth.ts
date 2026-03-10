export async function jsonResponse(
  corsHeaders: Record<string, string>,
  body: unknown,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export async function getAuthenticatedUser(params: {
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

export async function getProfileByUserId(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string;
}) {
  const response = await fetch(
    `${params.supabaseUrl}/rest/v1/profiles?id=eq.${params.userId}&select=*`,
    {
      headers: {
        apikey: params.serviceRoleKey,
        Authorization: `Bearer ${params.serviceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.[0] ?? null;
}

export async function assertAdmin(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  authHeader: string | null;
}) {
  const user = await getAuthenticatedUser(params);

  if (!user?.id) {
    return { ok: false, status: 401, error: "Não autenticado", user: null };
  }

  const profile = await getProfileByUserId({
    supabaseUrl: params.supabaseUrl,
    serviceRoleKey: params.serviceRoleKey,
    userId: user.id,
  });

  if (!profile?.is_admin) {
    return { ok: false, status: 403, error: "Acesso negado", user, profile };
  }

  if (profile?.is_blocked) {
    return { ok: false, status: 403, error: "Usuário bloqueado", user, profile };
  }

  return { ok: true, status: 200, error: null, user, profile };
}

export async function logAdminAction(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  adminUserId: string;
  targetUserId?: string | null;
  action: string;
  details?: Record<string, unknown>;
}) {
  await fetch(`${params.supabaseUrl}/rest/v1/admin_actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: params.serviceRoleKey,
      Authorization: `Bearer ${params.serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      admin_user_id: params.adminUserId,
      target_user_id: params.targetUserId ?? null,
      action: params.action,
      details: params.details ?? {},
    }),
  });
}