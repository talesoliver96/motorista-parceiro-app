import { supabase } from "../../lib/supabase";
import type { Earning } from "../../types/database";
import type { EarningFormValues } from "./earnings.schemas";

function nullableNumber(value: unknown) {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export const earningsService = {
  async listByPeriod(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("earnings")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Earning[];
  },

  async create(userId: string, values: EarningFormValues) {
    const payload = {
      user_id: userId,
      date: values.date,
      vehicle_type: values.vehicle_type,
      gross_amount: values.gross_amount,
      km_traveled: nullableNumber(values.km_traveled),
      fuel_efficiency: nullableNumber(values.fuel_efficiency),
      fuel_price: nullableNumber(values.fuel_price),
      auto_fuel_enabled: values.auto_fuel_enabled,
      platform: nullableString(values.platform),
      work_hours: nullableNumber(values.work_hours),
      trips_count: nullableNumber(values.trips_count),
      notes: nullableString(values.notes),
    };

    const { error } = await supabase.from("earnings").insert(payload);
    if (error) throw error;
  },

  async update(id: string, userId: string, values: EarningFormValues) {
    const payload = {
      user_id: userId,
      date: values.date,
      vehicle_type: values.vehicle_type,
      gross_amount: values.gross_amount,
      km_traveled: nullableNumber(values.km_traveled),
      fuel_efficiency: nullableNumber(values.fuel_efficiency),
      fuel_price: nullableNumber(values.fuel_price),
      auto_fuel_enabled: values.auto_fuel_enabled,
      platform: nullableString(values.platform),
      work_hours: nullableNumber(values.work_hours),
      trips_count: nullableNumber(values.trips_count),
      notes: nullableString(values.notes),
    };

    const { error } = await supabase
      .from("earnings")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async remove(id: string, userId: string) {
    const { error } = await supabase
      .from("earnings")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },
};