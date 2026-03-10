import { supabase } from "../../lib/supabase";
import type {
  AdminActionLogItem,
  AdminMetrics,
  AdminUserListItem,
  AdminUserUpdatePayload,
} from "./admin.types";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  return token;
}

async function callFunction(path: string, body: unknown) {
  const token = await getAccessToken();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Erro ao chamar ${path}`);
  }

  return data;
}

export const adminProService = {
  async listUsers(search = "") {
    const data = await callFunction("admin-users-pro", {
      action: "list",
      search,
    });

    return (data?.users ?? []) as AdminUserListItem[];
  },

  async updateUser(payload: AdminUserUpdatePayload) {
    return await callFunction("admin-users-pro", {
      action: "update",
      ...payload,
    });
  },

  async deleteUser(userId: string) {
    return await callFunction("admin-users-pro", {
      action: "delete",
      userId,
    });
  },

  async getMetrics() {
    const data = await callFunction("admin-metrics", {});
    return (data?.metrics ?? null) as AdminMetrics | null;
  },

  async getActionLogs(): Promise<AdminActionLogItem[]> {
    const { data, error } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data ?? []) as AdminActionLogItem[];
  },
};