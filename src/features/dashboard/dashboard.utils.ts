import dayjs from "dayjs";
import type { Earning, Expense } from "../../types/database";

export type EarningsChartPoint = {
  date: string;
  value: number;
};

export function sumGross(earnings: Earning[]) {
  return earnings.reduce((acc, item) => acc + Number(item.gross_amount || 0), 0);
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((acc, item) => acc + Number(item.amount || 0), 0);
}

export function sumKm(earnings: Earning[]) {
  return earnings.reduce((acc, item) => acc + Number(item.km_traveled || 0), 0);
}

export function groupEarningsByDay(earnings: Earning[]): EarningsChartPoint[] {
  const grouped = new Map<string, number>();

  earnings.forEach((item) => {
    const key = item.date;
    grouped.set(key, (grouped.get(key) ?? 0) + Number(item.gross_amount || 0));
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
    .map(([date, value]) => ({
      date: dayjs(date).format("DD/MM"),
      value,
    }));
}

export function calculateProjection(
  gross: number,
  startDate: string,
  endDate: string
) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const isCurrentMonth =
    start.isSame(dayjs(), "month") &&
    end.isSame(dayjs(), "month") &&
    start.date() === 1 &&
    end.date() === end.endOf("month").date();

  if (!isCurrentMonth) return null;

  const currentDay = dayjs().date();
  const totalDaysInMonth = dayjs().daysInMonth();

  if (currentDay <= 0) return null;

  return (gross / currentDay) * totalDaysInMonth;
}

export function getRecentActivity(
  earnings: Earning[],
  expenses: Expense[]
): Array<{
  id: string;
  type: "earning" | "expense";
  title: string;
  date: string;
  amount: number;
}> {
  const earningItems = earnings.map((item) => ({
    id: item.id,
    type: "earning" as const,
    title: item.platform || "Ganho",
    date: item.date,
    amount: item.gross_amount,
  }));

  const expenseItems = expenses.map((item) => ({
    id: item.id,
    type: "expense" as const,
    title: item.category,
    date: item.date,
    amount: item.amount,
  }));

  return [...earningItems, ...expenseItems]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 6);
}