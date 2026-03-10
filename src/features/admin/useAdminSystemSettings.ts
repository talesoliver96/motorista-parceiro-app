import { useEffect, useState } from "react";
import { adminSettingsService } from "./admin.pro.service";

export function useAdminSystemSettings() {
  const [loading, setLoading] = useState(true);

  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [pricing, setPricing] = useState({
    monthly_price: 5,
    quarterly_price: 12,
    semiannual_price: 22,
    annual_price: 40,
    stripe_price_monthly: "",
    stripe_price_quarterly: "",
    stripe_price_semiannual: "",
    stripe_price_annual: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const subscription = await adminSettingsService.getSetting("subscription_mode");
      const maintenance = await adminSettingsService.getSetting("maintenance_mode");
      const pricing = await adminSettingsService.getSetting("premium_pricing");

      setSubscriptionMode(Boolean(subscription?.enabled));

      setMaintenanceMode(Boolean(maintenance?.enabled));
      setMaintenanceMessage(maintenance?.message ?? "");

      if (pricing) setPricing(pricing);
    } finally {
      setLoading(false);
    }
  };

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