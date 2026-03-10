import { supabase } from "../../lib/supabase";
import type { Expense } from "../../types/database";
import type { ExpenseFormData } from "./expenses.schemas";

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isFuelCategory(category: string) {
  return category.trim().toLowerCase() === "combustível" ||
    category.trim().toLowerCase() === "combustivel";
}

export const expensesService = {
  async listByPeriod(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Expense[];
  },

  async create(userId: string, values: ExpenseFormData) {
    const payload = {
      user_id: userId,
      date: values.date,
      category: values.category,
      amount: values.amount,
      compensate_automatic_fuel:
        isFuelCategory(values.category) && values.compensate_automatic_fuel,
      notes: nullableString(values.notes),
    };

    const { error } = await supabase.from("expenses").insert(payload);
    if (error) throw error;
  },

  async update(id: string, userId: string, values: ExpenseFormData) {
    const payload = {
      user_id: userId,
      date: values.date,
      category: values.category,
      amount: values.amount,
      compensate_automatic_fuel:
        isFuelCategory(values.category) && values.compensate_automatic_fuel,
      notes: nullableString(values.notes),
    };

    const { error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async remove(id: string, userId: string) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },
};