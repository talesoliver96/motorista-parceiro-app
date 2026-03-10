import dayjs from "dayjs";
import type { Earning } from "../../types/database";

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

export function formatDate(value: string) {
  return dayjs(value).format("DD/MM/YYYY");
}

export function getCurrentMonthRange() {
  const now = dayjs();

  return {
    startDate: now.startOf("month").format("YYYY-MM-DD"),
    endDate: now.endOf("month").format("YYYY-MM-DD"),
  };
}

export function getEarningPerKm(item: Earning) {
  if (!item.km_traveled || item.km_traveled <= 0) return null;
  return item.gross_amount / item.km_traveled;
}

export function getEarningPerHour(item: Earning) {
  if (!item.work_hours || item.work_hours <= 0) return null;
  return item.gross_amount / item.work_hours;
}

export function getFuelCost(item: Earning) {
  if (
    !item.km_traveled ||
    !item.fuel_efficiency ||
    !item.fuel_price ||
    item.km_traveled <= 0 ||
    item.fuel_efficiency <= 0 ||
    item.fuel_price <= 0
  ) {
    return null;
  }

  return (item.km_traveled / item.fuel_efficiency) * item.fuel_price;
}