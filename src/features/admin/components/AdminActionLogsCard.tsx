import { Divider, Stack, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import type { AdminActionLogItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: AdminActionLogItem[];
};

function getActionLabel(action: string) {
  switch (action) {
    case "update_user":
      return "Atualizou usuário";
    case "delete_user":
      return "Excluiu usuário";
    default:
      return action;
  }
}

export function AdminActionLogsCard({ items }: Props) {
  return (
    <AppCard sx={{ height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Logs recentes de administração
      </Typography>

      <Stack spacing={1.5}>
        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma ação administrativa recente.
          </Typography>
        ) : (
          items.map((item, index) => (
            <Stack key={item.id} spacing={1}>
              <Stack spacing={0.3}>
                <Typography variant="body2" fontWeight={700}>
                  {getActionLabel(item.action)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin: {item.admin_user_id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Alvo: {item.target_user_id || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatAdminDate(item.created_at)}
                </Typography>
              </Stack>

              {index < items.length - 1 ? <Divider /> : null}
            </Stack>
          ))
        )}
      </Stack>
    </AppCard>
  );
}