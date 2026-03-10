import { useEffect, useState } from "react";
import { adminSettingsService } from "./admin.pro.service";

type PremiumPricingForm = {
  monthly_price: number;
  quarterly_price: number;
  semiannual_price: number;
  annual_price: number;
  stripe_price_monthly: string;
  stripe_price_quarterly: string;
  stripe_price_semiannual: string;
  stripe_price_annual: string;
};

const defaultPricing: PremiumPricingForm = {
  monthly_price: 5,
  quarterly_price: 12,
  semiannual_price: 22,
  annual_price: 40,
  stripe_price_monthly: "",
  stripe_price_quarterly: "",
  stripe_price_semiannual: "",
  stripe_price_annual: "",
};

export function useAdminSystemSettings() {
  const [loading, setLoading] = useState(true);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [pricing, setPricing] = useState<PremiumPricingForm>(defaultPricing);

  const load = async () => {
    try {
      setLoading(true);

      const [subscription, maintenance, premiumPricing] = await Promise.all([
        adminSettingsService.getSetting("subscription_mode"),
        adminSettingsService.getSetting("maintenance_mode"),
        adminSettingsService.getSetting("premium_pricing"),
      ]);

      setSubscriptionMode(Boolean(subscription?.enabled));
      setMaintenanceMode(Boolean(maintenance?.enabled));
      setMaintenanceMessage(maintenance?.message ?? "");

      if (premiumPricing) {
        setPricing({
          monthly_price: Number(premiumPricing.monthly_price ?? 5),
          quarterly_price: Number(premiumPricing.quarterly_price ?? 12),
          semiannual_price: Number(premiumPricing.semiannual_price ?? 22),
          annual_price: Number(premiumPricing.annual_price ?? 40),
          stripe_price_monthly: premiumPricing.stripe_price_monthly ?? "",
          stripe_price_quarterly: premiumPricing.stripe_price_quarterly ?? "",
          stripe_price_semiannual: premiumPricing.stripe_price_semiannual ?? "",
          stripe_price_annual: premiumPricing.stripe_price_annual ?? "",
        });
      } else {
        setPricing(defaultPricing);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSubscriptionMode = async () => {
    await adminSettingsService.updateSetting("subscription_mode", {
      enabled: subscriptionMode,
    });
  };

  const saveMaintenance = async () => {
    await adminSettingsService.updateSetting("maintenance_mode", {
      enabled: maintenanceMode,
      message: maintenanceMessage,
    });
  };

  const savePricing = async () => {
    await adminSettingsService.updateSetting("premium_pricing", pricing);
  };

  return {
    loading,
    load,
    subscriptionMode,
    setSubscriptionMode,
    saveSubscriptionMode,
    maintenanceMode,
    setMaintenanceMode,
    maintenanceMessage,
    setMaintenanceMessage,
    saveMaintenance,
    pricing,
    setPricing,
    savePricing,
  };
}