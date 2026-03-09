import dayjs from "dayjs";
import type { Profile } from "../../types/database";

export function isPremiumProfile(profile: Profile | null | undefined) {
  if (!profile) return false;
  if (!profile.premium) return false;
  if (profile.premium_forever) return true;
  if (!profile.premium_until) return false;

  return dayjs(profile.premium_until).isAfter(dayjs());
}

export function getPremiumDescription(profile: Profile | null | undefined) {
  if (!profile) return "Plano gratuito";

  if (profile.premium_forever) {
    return "Premium eterno";
  }

  if (profile.premium && profile.premium_until) {
    return `Premium até ${dayjs(profile.premium_until).format("DD/MM/YYYY")}`;
  }

  return "Plano gratuito";
}