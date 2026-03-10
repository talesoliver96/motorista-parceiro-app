import { useEffect, useState } from "react";
import type { PublicAppSettings } from "../admin/admin.types";
import { publicSettingsService } from "./public-settings.service";

const defaultSettings: PublicAppSettings = {
  subscriptionMode: { enabled: false },
  maintenanceMode: {
    enabled: false,
    message: "Estamos em manutenção no momento. Tente novamente em instantes.",
  },
  premiumPricing: {
    monthlyPrice: 5,
    quarterlyPrice: 12,
    semiannualPrice: 22,
    annualPrice: 40,
    stripePriceMonthly: "",
    stripePriceQuarterly: "",
    stripePriceSemiannual: "",
    stripePriceAnnual: "",
  },
};

export function usePublicAppSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PublicAppSettings>(defaultSettings);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await publicSettingsService.getSettings();

        if (cancelled) return;
        setSettings(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    settings,
    refresh: async () => {
      const data = await publicSettingsService.getSettings();
      setSettings(data);
    },
  };
}