import type { Earning } from "../../types/database";
import type { ExpenseListItem } from "../expenses/expenses.types";
import {
  groupEarningsByWeekday,
  groupExpensesByCategory,
  getTopNetDays,
} from "./reports.utils";
import { reportsProService } from "./reports.pro.service";

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
  async getReportsData(startDate: string, endDate: string) {
    const response = await reportsProService.getPremiumReports(startDate, endDate);

    const earnings = (response.earnings ?? []) as Earning[];
    const allExpenses = (response.expenses ?? []) as ExpenseListItem[];

    const manualExpenses = allExpenses.filter(
      (item) => item.source === "manual"
    );

    const automaticFuelExpenses = allExpenses.filter(
      (item) => item.source === "automatic_fuel"
    );

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