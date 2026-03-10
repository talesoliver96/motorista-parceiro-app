import { Divider, Pagination, Stack, Typography } from "@mui/material";

import { AppCard } from "../../../components/common/AppCard";
import type { AdminActionLogItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: AdminActionLogItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

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

export function AdminActionLogsCard({
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
          <Typography variant="h6">Logs recentes de administração</Typography>

          <Typography variant="body2" color="text.secondary">
            {totalItems} registro{totalItems === 1 ? "" : "s"}
          </Typography>
        </Stack>

        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Carregando logs administrativos..."
              : "Nenhuma ação administrativa recente."}
          </Typography>
        ) : (
          <>
            <Stack divider={<Divider flexItem />}>
              {items.map((item) => (
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