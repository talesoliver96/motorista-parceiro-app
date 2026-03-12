import type { Earning } from "../types/database";
import type { ExpenseListItem } from "../features/expenses/expenses.types";

export type AdvancedMovementFilters = {
  search: string;
  category: string;
  notes: string;
  exactDay: string;
  exactMonth: string;
  exactYear: string;
};

export const emptyAdvancedMovementFilters: AdvancedMovementFilters = {
  search: "",
  category: "",
  notes: "",
  exactDay: "",
  exactMonth: "",
  exactYear: "",
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function includesNormalized(value: unknown, query: string) {
  const text = normalize(value);
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return true;
  return text.includes(normalizedQuery);
}

function matchesDateFilters(
  date: string,
  filters: AdvancedMovementFilters
) {
  if (filters.exactDay && date !== filters.exactDay) {
    return false;
  }

  if (filters.exactMonth && !date.startsWith(filters.exactMonth)) {
    return false;
  }

  if (filters.exactYear && !date.startsWith(filters.exactYear)) {
    return false;
  }

  return true;
}

export function buildUniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filterEarnings(
  items: Earning[],
  filters: AdvancedMovementFilters
) {
  return items.filter((item) => {
    if (!matchesDateFilters(item.date, filters)) {
      return false;
    }

    if (
      filters.category &&
      !includesNormalized(
        `${item.platform ?? ""} ${item.vehicle_type ?? ""}`,
        filters.category
      )
    ) {
      return false;
    }

    if (filters.notes && !includesNormalized(item.notes, filters.notes)) {
      return false;
    }

    if (
      filters.search &&
      !includesNormalized(
        [
          item.platform,
          item.notes,
          item.vehicle_type,
          item.date,
          item.gross_amount,
          item.km_traveled,
          item.work_hours,
          item.trips_count,
        ].join(" "),
        filters.search
      )
    ) {
      return false;
    }

    return true;
  });
}

export function filterExpenseItems(
  items: ExpenseListItem[],
  filters: AdvancedMovementFilters
) {
  return items.filter((item) => {
    if (!matchesDateFilters(item.date, filters)) {
      return false;
    }

    if (filters.category && !includesNormalized(item.category, filters.category)) {
      return false;
    }

    if (filters.notes && !includesNormalized(item.notes, filters.notes)) {
      return false;
    }

    if (
      filters.search &&
      !includesNormalized(
        [
          item.category,
          item.notes,
          item.date,
          item.amount,
          item.source,
        ].join(" "),
        filters.search
      )
    ) {
      return false;
    }

    return true;
  });
}

export function buildNetByEarningId(
  earnings: Earning[],
  expenses: ExpenseListItem[]
) {
  const grossByDate = new Map<string, number>();
  const expensesByDate = new Map<string, number>();

  for (const earning of earnings) {
    grossByDate.set(
      earning.date,
      Number(
        ((grossByDate.get(earning.date) ?? 0) + Number(earning.gross_amount || 0)).toFixed(2)
      )
    );
  }

  for (const expense of expenses) {
    expensesByDate.set(
      expense.date,
      Number(
        ((expensesByDate.get(expense.date) ?? 0) + Number(expense.amount || 0)).toFixed(2)
      )
    );
  }

  const result: Record<string, number> = {};

  for (const earning of earnings) {
    const gross = Number(earning.gross_amount || 0);
    const dailyGross = Number(grossByDate.get(earning.date) ?? 0);
    const dailyExpenses = Number(expensesByDate.get(earning.date) ?? 0);

    if (dailyGross <= 0) {
      result[earning.id] = gross;
      continue;
    }

    const proportionalExpenses = Number(
      ((dailyExpenses * gross) / dailyGross).toFixed(2)
    );

    result[earning.id] = Number((gross - proportionalExpenses).toFixed(2));
  }

  return result;
}