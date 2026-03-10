import type { Earning, Expense } from "../../types/database";
import type { ExpenseListItem } from "./expenses.types";
import { getAutomaticFuelCost } from "../earnings/earnings.utils";

type AutomaticFuelDraft = ExpenseListItem & {
  remaining_amount: number;
};

function normalizeText(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function isFuelExpenseCategory(category: string) {
  const normalized = normalizeText(category);
  return normalized === "combustível" || normalized === "combustivel";
}

function sortByDateAsc<T extends { date: string; created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.date === b.date) {
      return a.created_at.localeCompare(b.created_at);
    }

    return a.date.localeCompare(b.date);
  });
}

function sortByDateDesc<T extends { date: string; created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.date === b.date) {
      return b.created_at.localeCompare(a.created_at);
    }

    return b.date.localeCompare(a.date);
  });
}

function composeManualNotes(
  expense: Expense,
  compensatedAmount: number,
  originalAmount: number,
  effectiveAmount: number
) {
  const base = expense.notes?.trim() || "";

  if (compensatedAmount <= 0) {
    return base || null;
  }

  const compensationText =
    `Compensação automática aplicada: ${compensatedAmount.toFixed(
      2
    )}. Valor original: ${originalAmount.toFixed(2)}. Valor considerado: ${effectiveAmount.toFixed(2)}.`;

  return base ? `${base} | ${compensationText}` : compensationText;
}

function composeAutomaticNotes(
  compensatedAmount: number,
  remainingAmount: number
) {
  if (compensatedAmount <= 0) {
    return "Gasto automático calculado a partir de KM, consumo e preço do combustível.";
  }

  return `Gasto automático calculado a partir de KM, consumo e preço do combustível. Compensação manual aplicada: ${compensatedAmount.toFixed(
    2
  )}. Valor restante considerado: ${remainingAmount.toFixed(2)}.`;
}

export function buildAutomaticFuelExpenses(
  earnings: Earning[]
): ExpenseListItem[] {
  return earnings
    .map((item) => {
      const fuelCost = getAutomaticFuelCost(item);

      if (!fuelCost) return null;

      const rounded = Number(fuelCost.toFixed(2));

      const expense: ExpenseListItem = {
        id: `fuel-${item.id}`,
        user_id: item.user_id,
        date: item.date,
        category: "Combustível",
        amount: rounded,
        compensate_automatic_fuel: false,
        notes: "Gasto automático calculado a partir de KM, consumo e preço do combustível.",
        created_at: item.created_at,
        updated_at: item.updated_at,
        source: "automatic_fuel",
        isReadonly: true,
        source_earning_id: item.id,
        original_amount: rounded,
        effective_amount: rounded,
        compensated_automatic_fuel_amount: 0,
      };

      return expense;
    })
    .filter((item): item is ExpenseListItem => item !== null);
}

export function buildReconciledExpenseData(
  manualExpenses: Expense[],
  earnings: Earning[],
  isPremium: boolean
) {
  const automaticBase: AutomaticFuelDraft[] = isPremium
    ? buildAutomaticFuelExpenses(earnings).map((item) => ({
        ...item,
        remaining_amount: Number(item.amount.toFixed(2)),
      }))
    : [];

  const automaticQueue = sortByDateAsc(automaticBase);

  const manualDisplayItems = sortByDateAsc(manualExpenses).map((expense) => {
    const originalAmount = Number(expense.amount || 0);
    let effectiveAmount = originalAmount;
    let compensatedAmount = 0;

    if (
      isPremium &&
      expense.compensate_automatic_fuel &&
      isFuelExpenseCategory(expense.category)
    ) {
      for (const automaticItem of automaticQueue) {
        if (effectiveAmount <= 0) break;
        if (automaticItem.remaining_amount <= 0) continue;

        const used = Math.min(effectiveAmount, automaticItem.remaining_amount);

        automaticItem.remaining_amount = Number(
          (automaticItem.remaining_amount - used).toFixed(2)
        );
        effectiveAmount = Number((effectiveAmount - used).toFixed(2));
        compensatedAmount = Number((compensatedAmount + used).toFixed(2));
      }
    }

    const item: ExpenseListItem = {
      ...expense,
      source: "manual",
      isReadonly: false,
      amount: effectiveAmount,
      original_amount: originalAmount,
      effective_amount: effectiveAmount,
      compensated_automatic_fuel_amount: compensatedAmount,
      notes: composeManualNotes(
        expense,
        compensatedAmount,
        originalAmount,
        effectiveAmount
      ),
    };

    return item;
  });

  const automaticDisplayItemsRaw = automaticQueue.map((item) => {
    const remainingAmount = Number(item.remaining_amount.toFixed(2));
    const originalAmount = Number(item.original_amount ?? item.amount ?? 0);
    const compensatedAmount = Number(
      (originalAmount - remainingAmount).toFixed(2)
    );

    if (remainingAmount <= 0) {
      return null;
    }

    const displayItem: ExpenseListItem = {
      id: item.id,
      user_id: item.user_id,
      date: item.date,
      category: item.category,
      amount: remainingAmount,
      compensate_automatic_fuel: item.compensate_automatic_fuel,
      notes: composeAutomaticNotes(compensatedAmount, remainingAmount),
      created_at: item.created_at,
      updated_at: item.updated_at,
      source: "automatic_fuel",
      isReadonly: true,
      source_earning_id: item.source_earning_id,
      original_amount: originalAmount,
      effective_amount: remainingAmount,
      compensated_automatic_fuel_amount: compensatedAmount,
    };

    return displayItem;
  });

  const automaticDisplayItems = automaticDisplayItemsRaw.filter(
    (item): item is ExpenseListItem => item !== null
  );

  const items = sortByDateDesc([...manualDisplayItems, ...automaticDisplayItems]);

  const manualTotal = Number(
    manualDisplayItems
      .reduce((acc, item) => acc + Number(item.amount || 0), 0)
      .toFixed(2)
  );

  const automaticFuelTotal = Number(
    automaticDisplayItems
      .reduce((acc, item) => acc + Number(item.amount || 0), 0)
      .toFixed(2)
  );

  const compensatedFuelTotal = Number(
    manualDisplayItems
      .reduce(
        (acc, item) => acc + Number(item.compensated_automatic_fuel_amount || 0),
        0
      )
      .toFixed(2)
  );

  const totalExpenses = Number((manualTotal + automaticFuelTotal).toFixed(2));

  return {
    items,
    manualItems: manualDisplayItems,
    automaticFuelItems: automaticDisplayItems,
    manualTotal,
    automaticFuelTotal,
    compensatedFuelTotal,
    totalExpenses,
  };
}