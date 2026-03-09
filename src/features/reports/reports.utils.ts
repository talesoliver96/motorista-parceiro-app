import dayjs from "dayjs";
import type { Earning } from "../../types/database";
import type { ExpenseListItem } from "../expenses/expenses.types";

export type WeekdayChartItem = {
  day: string;
  gross: number;
};

export type ExpenseCategoryChartItem = {
  category: string;
  amount: number;
};

export type TopNetDayItem = {
  date: string;
  gross: number;
  expenses: number;
  net: number;
};

const weekdayLabels = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

export function groupEarningsByWeekday(earnings: Earning[]): WeekdayChartItem[] {
  const totals = [0, 0, 0, 0, 0, 0, 0];

  earnings.forEach((item) => {
    const dayIndex = dayjs(item.date).day();
    totals[dayIndex] += Number(item.gross_amount || 0);
  });

  return weekdayLabels.map((day, index) => ({
    day,
    gross: Number(totals[index].toFixed(2)),
  }));
}

export function groupExpensesByCategory(
  expenses: ExpenseListItem[]
): ExpenseCategoryChartItem[] {
  const grouped = new Map<string, number>();

  expenses.forEach((item) => {
    const category =
      item.source === "automatic_fuel"
        ? "Combustível automático"
        : item.category;

    grouped.set(category, (grouped.get(category) ?? 0) + Number(item.amount || 0));
  });

  return Array.from(grouped.entries())
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTopNetDays(
  earnings: Earning[],
  expenses: ExpenseListItem[]
): TopNetDayItem[] {
  const grossByDate = new Map<string, number>();
  const expensesByDate = new Map<string, number>();

  earnings.forEach((item) => {
    grossByDate.set(
      item.date,
      (grossByDate.get(item.date) ?? 0) + Number(item.gross_amount || 0)
    );
  });

  expenses.forEach((item) => {
    expensesByDate.set(
      item.date,
      (expensesByDate.get(item.date) ?? 0) + Number(item.amount || 0)
    );
  });

  const allDates = Array.from(
    new Set([...grossByDate.keys(), ...expensesByDate.keys()])
  );

  return allDates
    .map((date) => {
      const gross = Number((grossByDate.get(date) ?? 0).toFixed(2));
      const totalExpenses = Number((expensesByDate.get(date) ?? 0).toFixed(2));
      const net = Number((gross - totalExpenses).toFixed(2));

      return {
        date,
        gross,
        expenses: totalExpenses,
        net,
      };
    })
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);
}