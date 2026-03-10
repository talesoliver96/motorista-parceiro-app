import {
  Chip,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency, formatDate } from "../../earnings/earnings.utils";
import { getTotalPages, paginateArray } from "../../../utils/pagination";
import type { AppMode } from "../../../types/database";

type Item = {
  id: string;
  type: "earning" | "expense";
  title: string;
  date: string;
  amount: number;
};

type Props = {
  items: Item[];
  appMode?: AppMode;
};

const PAGE_SIZE = 10;

export function RecentActivityCard({
  items,
  appMode = "driver",
}: Props) {
  const [page, setPage] = useState(1);
  const isBasicMode = appMode === "basic";

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = useMemo(
    () => getTotalPages(items.length, PAGE_SIZE),
    [items.length]
  );

  const paginatedItems = useMemo(
    () => paginateArray(items, page, PAGE_SIZE),
    [items, page]
  );

  return (
    <AppCard sx={{ height: "100%" }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          {isBasicMode ? "Movimentações recentes" : "Atividade recente"}
        </Typography>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            {isBasicMode
              ? "Nenhuma movimentação registrada no período."
              : "Nenhuma movimentação no período."}
          </Typography>
        ) : (
          <>
            <Stack spacing={1.5}>
              {paginatedItems.map((item) => (
                <Stack key={item.id} spacing={0.4}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {item.title}
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        item.type === "earning"
                          ? isBasicMode
                            ? "Entrada"
                            : "Ganho"
                          : isBasicMode
                          ? "Saída"
                          : "Gasto"
                      }
                      color={item.type === "earning" ? "success" : "default"}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    {formatDate(item.date)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color={item.type === "earning" ? "success.main" : "error.main"}
                  >
                    {item.type === "earning" ? "+" : "-"} {formatCurrency(item.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {totalPages > 1 ? (
              <Stack direction="row" justifyContent="flex-end">
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="small"
                />
              </Stack>
            ) : null}
          </>
        )}
      </Stack>
    </AppCard>
  );
}