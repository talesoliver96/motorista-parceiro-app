import {
  Chip,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency, formatDate } from "../../earnings/earnings.utils";
import { getTotalPages, paginateArray } from "../../../utils/pagination";

type Item = {
  id: string;
  type: "earning" | "expense";
  title: string;
  date: string;
  amount: number;
};

type Props = {
  items: Item[];
};

const PAGE_SIZE = 10;

export function RecentActivityCard({ items }: Props) {
  const [page, setPage] = useState(1);

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
        <Typography variant="h6">Atividade recente</Typography>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma movimentação no período.
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
                      label={item.type === "earning" ? "Ganho" : "Gasto"}
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

            <Stack direction="row" justifyContent="flex-end">
              <Pagination
                page={page}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Stack>
          </>
        )}
      </Stack>
    </AppCard>
  );
}