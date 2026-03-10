import { Divider, Pagination, Stack, Typography } from "@mui/material";

import { AppCard } from "../../../components/common/AppCard";
import type { PremiumHistoryItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: PremiumHistoryItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

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

export function PremiumHistoryCard({
  items,
  page,
  totalPages,
  totalItems,
  loading = false,
  onPageChange,
}: Props) {
  return (
    <AppCard>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Typography variant="h6">Histórico premium</Typography>

          <Typography variant="body2" color="text.secondary">
            {totalItems} registro{totalItems === 1 ? "" : "s"}
          </Typography>
        </Stack>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Carregando histórico premium..."
              : "Nenhuma alteração premium recente."}
          </Typography>
        ) : (
          <>
            <Stack divider={<Divider flexItem />}>
              {items.map((item) => (
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
              <Stack alignItems="center" pt={1}>
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_, nextPage) => onPageChange(nextPage)}
                  color="primary"
                  size="small"
                  disabled={loading}
                />
              </Stack>
            ) : null}
          </>
        )}
      </Stack>
    </AppCard>
  );
}