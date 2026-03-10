export type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  premium: boolean;
  premium_forever: boolean;
  premium_until: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string | null;
  last_sign_in_at: string | null;
};

export type AdminUserUpdatePayload = {
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

export type AdminMetrics = {
  totalUsers: number;
  premiumUsers: number;
  adminUsers: number;
  blockedUsers: number;
  usersCreatedToday: number;
  usersCreatedLast7Days: number;
  usersLoggedRecently: number;
};

export type AdminActionLogItem = {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};