import { supabase } from "../../lib/supabase";
import type { Earning, Expense } from "../../types/database";
import {
  calculateProjection,
  getRecentActivity,
  groupEarningsByDay,
  sumExpenses,
  sumGross,
  sumKm,
} from "./dashboard.utils";
import { buildReconciledExpenseData } from "../expenses/expenses.utils";
import type { ExpenseListItem } from "../expenses/expenses.types";

export type DashboardData = {
  earnings: Earning[];
  expenses: ExpenseListItem[];
  gross: number;
  totalExpenses: number;
  net: number;
  km: number;
  earningPerKm: number | null;
  chartData: Array<{ date: string; value: number }>;
  projection: number | null;
  recentActivity: Array<{
    id: string;
    type: "earning" | "expense";
    title: string;
    date: string;
    amount: number;
  }>;
};

export const dashboardService = {
  async getDashboardData(
    userId: string,
    startDate: string,
    endDate: string,
    isPremium: boolean
  ) {
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
    const manualExpenses = (expensesResult.data ?? []) as Expense[];

    const reconciled = buildReconciledExpenseData(
      manualExpenses,
      earnings,
      isPremium
    );

    const expenses = reconciled.items;
    const gross = sumGross(earnings);
    const totalExpenses = sumExpenses(expenses);
    const net = gross - totalExpenses;
    const km = sumKm(earnings);
    const earningPerKm = isPremium && km > 0 ? gross / km : null;

    return {
      earnings,
      expenses,
      gross,
      totalExpenses,
      net,
      km,
      earningPerKm,
      chartData: groupEarningsByDay(earnings),
      projection: isPremium ? calculateProjection(gross, startDate, endDate) : null,
      recentActivity: getRecentActivity(earnings, expenses),
    } satisfies DashboardData;
  },
};