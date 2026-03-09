import type { Expense } from "../../types/database";

export type ExpenseListItem = Expense & {
  source: "manual" | "automatic_fuel";
  isReadonly?: boolean;
  source_earning_id?: string;
};