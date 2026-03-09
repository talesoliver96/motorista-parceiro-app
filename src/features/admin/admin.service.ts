import { supabase } from "../../lib/supabase";
import type {
  AdminUserListItem,
  AdminUserUpdatePayload,
} from "./admin.types";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export const adminService = {
  async listUsers(search = "") {
    const headers = await getAuthHeaders();

    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: {
        action: "list",
        search,
      },
      headers,
    });

    if (error) throw error;

    return (data?.users ?? []) as AdminUserListItem[];
  },

  async updateUser(payload: AdminUserUpdatePayload) {
    const headers = await getAuthHeaders();

    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: {
        action: "update",
        ...payload,
      },
      headers,
    });

    if (error) throw error;

    return data;
  },
};