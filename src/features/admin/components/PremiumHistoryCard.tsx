import { Divider, Pagination, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { AppCard } from "../../../components/common/AppCard";
import { getTotalPages, paginateArray } from "../../../utils/pagination";
import type { PremiumHistoryItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: PremiumHistoryItem[];
};

const PAGE_SIZE = 10;

function getUserLabel(item: PremiumHistoryItem) {
  if (item.user_name && item.user_email) {
    return `${item.user_name} (${item.user_email})`;
  }

  if (item.user_name) {
    return item.user_name;
  }

  if (item.user_email) {
    return item.user_email;
  }

  return item.user_id;
}

export function PremiumHistoryCard({ items }: Props) {
  const [page, setPage] = useState(1);

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
    <AppCard>
      <Stack spacing={2}>
        <Typography variant="h6">Histórico premium</Typography>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma alteração premium recente.
          </Typography>
        ) : (
          <>
            <Stack divider={<Divider flexItem />}>
              {paginatedItems.map((item) => (
                <Stack key={item.id} spacing={0.5} py={1}>
                  <Typography variant="subtitle2">{item.action}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Usuário: {getUserLabel(item)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Novo premium: {item.new_premium ? "Sim" : "Não"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Novo premium até: {item.new_premium_until || "-"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formatAdminDate(item.created_at)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {totalPages > 1 ? (
              <Stack alignItems="center">
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