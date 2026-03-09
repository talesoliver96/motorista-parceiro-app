import { supabase } from "../../lib/supabase";
import type { Earning, Expense } from "../../types/database";
import type { ExpenseListItem } from "../expenses/expenses.types";
import { buildAutomaticFuelExpenses } from "../expenses/expenses.utils";
import {
  groupEarningsByWeekday,
  groupExpensesByCategory,
  getTopNetDays,
} from "./reports.utils";

export type ReportsData = {
  earnings: Earning[];
  manualExpenses: ExpenseListItem[];
  automaticFuelExpenses: ExpenseListItem[];
  allExpenses: ExpenseListItem[];
  gross: number;
  manualExpensesTotal: number;
  automaticFuelTotal: number;
  totalExpenses: number;
  net: number;
  totalKm: number;
  earningPerKm: number | null;
  earningsByWeekday: Array<{ day: string; gross: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  topNetDays: Array<{
    date: string;
    gross: number;
    expenses: number;
    net: number;
  }>;
};

export const reportsService = {
  async getReportsData(userId: string, startDate: string, endDate: string) {
    const [earningsResult, expensesResult] = await Promise.all([
      supabase
        .from("earnings")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false }),
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false }),
    ]);

    if (earningsResult.error) throw earningsResult.error;
    if (expensesResult.error) throw expensesResult.error;

    const earnings = (earningsResult.data ?? []) as Earning[];
    const manualExpensesRaw = (expensesResult.data ?? []) as Expense[];

    const manualExpenses: ExpenseListItem[] = manualExpensesRaw.map((item) => ({
      ...item,
      source: "manual",
      isReadonly: false,
    }));

    const automaticFuelExpenses = buildAutomaticFuelExpenses(earnings);
    const allExpenses = [...manualExpenses, ...automaticFuelExpenses];

    const gross = earnings.reduce(
      (acc, item) => acc + Number(item.gross_amount || 0),
      0
    );

    const manualExpensesTotal = manualExpenses.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    const automaticFuelTotal = automaticFuelExpenses.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    const totalExpenses = manualExpensesTotal + automaticFuelTotal;

    const totalKm = earnings.reduce(
      (acc, item) => acc + Number(item.km_traveled || 0),
      0
    );

    const net = gross - totalExpenses;
    const earningPerKm = totalKm > 0 ? gross / totalKm : null;

    return {
      earnings,
      manualExpenses,
      automaticFuelExpenses,
      allExpenses,
      gross: Number(gross.toFixed(2)),
      manualExpensesTotal: Number(manualExpensesTotal.toFixed(2)),
      automaticFuelTotal: Number(automaticFuelTotal.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      net: Number(net.toFixed(2)),
      totalKm: Number(totalKm.toFixed(2)),
      earningPerKm: earningPerKm ? Number(earningPerKm.toFixed(2)) : null,
      earningsByWeekday: groupEarningsByWeekday(earnings),
      expensesByCategory: groupExpensesByCategory(allExpenses),
      topNetDays: getTopNetDays(earnings, allExpenses),
    } satisfies ReportsData;
  },
};