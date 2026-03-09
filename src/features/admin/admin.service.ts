import { supabase } from "../../lib/supabase";
import type {
  AdminUserListItem,
  AdminUserUpdatePayload,
} from "./admin.types";

export const adminService = {
  async listUsers(search = "") {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: {
        action: "list",
        search,
      },
    });

    if (error) throw error;

    return (data?.users ?? []) as AdminUserListItem[];
  },

  async updateUser(payload: AdminUserUpdatePayload) {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: {
        action: "update",
        ...payload,
      },
    });

    if (error) throw error;

    return data;
  },
};