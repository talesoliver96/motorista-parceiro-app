export type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  premium: boolean;
  premium_forever: boolean;
  premium_until: string | null;
  is_admin: boolean;
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
};