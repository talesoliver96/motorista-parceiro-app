import dayjs from "dayjs";
import type { Earning } from "../../types/database";

// Formata dinheiro em real.
export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

// Formata data padrão brasileiro.
export function formatDate(value: string) {
  return dayjs(value).format("DD/MM/YYYY");
}

// Retorna primeiro e último dia do mês atual.
// Esse será o filtro inicial da tela.
export function getCurrentMonthRange() {
  const now = dayjs();

  return {
    startDate: now.startOf("month").format("YYYY-MM-DD"),
    endDate: now.endOf("month").format("YYYY-MM-DD"),
  };
}

// Cálculo opcional de ganho por km.
// Se faltar dado, retorna null.
export function getEarningPerKm(item: Earning) {
  if (!item.km_traveled || item.km_traveled <= 0) return null;
  return item.gross_amount / item.km_traveled;
}

// Cálculo opcional de custo de combustível.
// Se faltar dado, retorna null.
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