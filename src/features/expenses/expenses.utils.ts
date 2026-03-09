import type { Earning } from "../../types/database";
import type { ExpenseListItem } from "./expenses.types";
import { getFuelCost } from "../earnings/earnings.utils";

export function buildAutomaticFuelExpenses(
  earnings: Earning[]
): ExpenseListItem[] {
  const items = earnings
    .map((item) => {
      const fuelCost = getFuelCost(item);

      if (!fuelCost) return null;

      const expense: ExpenseListItem = {
        id: `fuel-${item.id}`,
        user_id: item.user_id,
        date: item.date,
        category: "Combustível",
        amount: Number(fuelCost.toFixed(2)),
        notes:
          "Gasto automático calculado a partir de KM, consumo e preço do combustível.",
        created_at: item.created_at,
        updated_at: item.updated_at,
        source: "automatic_fuel",
        isReadonly: true,
        source_earning_id: item.id,
      };

      return expense;
    })
    .filter((item): item is ExpenseListItem => item !== null);

  return items;
}