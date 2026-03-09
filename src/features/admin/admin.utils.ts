import dayjs from "dayjs";
import type { Profile } from "../../types/database";

export function isAdminProfile(profile: Profile | null | undefined) {
  return Boolean(profile?.is_admin);
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY HH:mm");
}

export function getPremiumLabel(params: {
  premium: boolean;
  premium_forever: boolean;
  premium_until: string | null;
}) {
  if (!params.premium) return "Free";
  if (params.premium_forever) return "Premium";
  if (params.premium_until) return `Premium até ${dayjs(params.premium_until).format("DD/MM/YYYY")}`;
  return "Premium";
}