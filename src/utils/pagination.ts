import dayjs from "dayjs";

export function getSmartListPageSize(startDate: string, endDate: string) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const isSameMonth = start.isSame(end, "month") && start.isSame(end, "year");
  const isFullMonth =
    isSameMonth &&
    start.date() === 1 &&
    end.isSame(start.endOf("month"), "day");

  if (isFullMonth) {
    return start.daysInMonth();
  }

  return 30;
}

export function paginateArray<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}