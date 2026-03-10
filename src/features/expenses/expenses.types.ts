import type { Expense } from "../../types/database";

export type ExpenseListItem = Expense & {
  source: "manual" | "automatic_fuel";
  isReadonly?: boolean;
  source_earning_id?: string;
  original_amount?: number;
  effective_amount?: number;
  compensated_automatic_fuel_amount?: number;
};