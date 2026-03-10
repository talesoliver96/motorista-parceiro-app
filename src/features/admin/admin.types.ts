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
  monthlyPremiumPrice: number;
  potentialMrr: number;
  potentialArr: number;
};

export type AdminActionLogItem = {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  admin_name?: string | null;
  target_name?: string | null;
};

export type PremiumHistoryItem = {
  id: string;
  user_id: string;
  admin_user_id: string | null;
  action: string;
  old_premium: boolean | null;
  new_premium: boolean | null;
  old_premium_until: string | null;
  new_premium_until: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user_name?: string | null;
  admin_name?: string | null;
  user_email?: string | null;
};

export type NewUserPremiumPolicy = {
  enabled: boolean;
  durationDays: number;
};

export type SubscriptionMode = {
  enabled: boolean;
};

export type MaintenanceMode = {
  enabled: boolean;
  message: string;
};

export type PremiumPricing = {
  monthlyPrice: number;
  quarterlyPrice: number;
  semiannualPrice: number;
  annualPrice: number;
  stripePriceMonthly: string;
  stripePriceQuarterly: string;
  stripePriceSemiannual: string;
  stripePriceAnnual: string;
};

export type PublicAppSettings = {
  subscriptionMode: SubscriptionMode;
  maintenanceMode: MaintenanceMode;
  premiumPricing: PremiumPricing;
};