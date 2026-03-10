import { supabase } from "../../lib/supabase";
import type {
  AdminActionLogItem,
  AdminMetrics,
  AdminUserListItem,
  AdminUserUpdatePayload,
  NewUserPremiumPolicy,
  PaginatedResult,
  PremiumHistoryItem,
  UserListFilter,
} from "./admin.types";

export const adminSettingsService = {
  async getSetting(key: string) {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error) throw error;
    return data?.value;
  },

  async updateSetting(key: string, value: unknown) {
    const { error } = await supabase
      .from("app_settings")
      .update({
        value,
        updated_at: new Date().toISOString(),
      })
      .eq("key", key);

    if (error) throw error;
  },
};

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

function toCsvValue(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildPaginatedResult<T>(
  items: T[],
  total: number | null,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const safeTotal = Math.max(0, total ?? 0);
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));

  return {
    items,
    total: safeTotal,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export const adminProService = {
  async listUsers(
    search = "",
    page = 1,
    pageSize = 10,
    filter: UserListFilter = "all"
  ): Promise<PaginatedResult<AdminUserListItem>> {
    const data = await callFunction("admin-users-pro", {
      action: "list",
      search,
      page,
      pageSize,
      filter,
    });

    return {
      items: (data?.users ?? []) as AdminUserListItem[],
      total: Number(data?.total ?? 0),
      page: Number(data?.page ?? page),
      pageSize: Number(data?.pageSize ?? pageSize),
      totalPages: Number(data?.totalPages ?? 1),
    };
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

  async getActionLogs(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<AdminActionLogItem>> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, count, error } = await supabase
      .from("admin_actions_enriched")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return buildPaginatedResult(
      (data ?? []) as AdminActionLogItem[],
      count,
      safePage,
      safePageSize
    );
  },

  async getPremiumHistory(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<PremiumHistoryItem>> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, count, error } = await supabase
      .from("premium_history_enriched")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return buildPaginatedResult(
      (data ?? []) as PremiumHistoryItem[],
      count,
      safePage,
      safePageSize
    );
  },

  async getNewUserPremiumPolicy(): Promise<NewUserPremiumPolicy> {
    const data = await callFunction("admin-users-pro", {
      action: "get_global_settings",
    });

    return {
      enabled: Boolean(data?.policy?.enabled),
      durationDays: Number(data?.policy?.durationDays ?? 365),
    };
  },

  async setNewUserPremiumPolicy(enabled: boolean, durationDays: number) {
    return await callFunction("admin-users-pro", {
      action: "set_new_user_premium_policy",
      enabled,
      durationDays,
    });
  },

  async applyPremiumToAll(durationDays: number) {
    return await callFunction("admin-users-pro", {
      action: "apply_premium_to_all",
      durationDays,
    });
  },

  async revokePremiumFromAll() {
    return await callFunction("admin-users-pro", {
      action: "revoke_premium_from_all",
    });
  },

  async resetSystemData() {
    return await callFunction("admin-users-pro", {
      action: "reset_system_data",
    });
  },

  async clearAllNonAdminUsers() {
    return await callFunction("admin-users-pro", {
      action: "clear_all_non_admin_users",
    });
  },

  exportUsersCsv(users: AdminUserListItem[]) {
    const header = [
      "Nome",
      "Email",
      "Telefone",
      "Premium",
      "Premium até",
      "Admin",
      "Bloqueado",
      "Criado em",
      "Último login",
    ];

    const rows = users.map((user) => [
      user.name,
      user.email,
      user.phone ?? "",
      user.premium ? "Sim" : "Não",
      user.premium_until ?? "",
      user.is_admin ? "Sim" : "Não",
      user.is_blocked ? "Sim" : "Não",
      user.created_at ?? "",
      user.last_sign_in_at ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "usuarios-motorista-parceiro.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};