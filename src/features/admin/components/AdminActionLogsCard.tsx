import { Divider, Pagination, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { AppCard } from "../../../components/common/AppCard";
import { getTotalPages, paginateArray } from "../../../utils/pagination";
import type { AdminActionLogItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: AdminActionLogItem[];
};

const PAGE_SIZE = 10;

function getActionLabel(action: string) {
  switch (action) {
    case "update_user":
      return "Atualizou usuário";
    case "delete_user":
      return "Excluiu usuário";
    case "apply_premium_to_all":
      return "Aplicou premium em massa";
    case "revoke_premium_from_all":
      return "Revogou premium em massa";
    case "set_new_user_premium_policy":
      return "Alterou política de novos usuários";
    case "reset_system_data":
      return "Resetou dados do sistema";
    case "clear_all_non_admin_users":
      return "Removeu todos os usuários não-admin";
    default:
      return action;
  }
}

export function AdminActionLogsCard({ items }: Props) {
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
        <Typography variant="h6">Logs recentes de administração</Typography>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma ação administrativa recente.
          </Typography>
        ) : (
          <>
            <Stack divider={<Divider flexItem />}>
              {paginatedItems.map((item) => (
                <Stack key={item.id} spacing={0.5} py={1}>
                  <Typography variant="subtitle2">
                    {getActionLabel(item.action)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Admin: {item.admin_name || item.admin_user_id}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Alvo: {item.target_name || item.target_user_id || "-"}
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