import { Divider, Stack, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import type { PremiumHistoryItem } from "../admin.types";
import { formatAdminDate } from "../admin.utils";

type Props = {
  items: PremiumHistoryItem[];
};

export function PremiumHistoryCard({ items }: Props) {
  return (
    <AppCard sx={{ height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Histórico premium
      </Typography>

      <Stack spacing={1.5}>
        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma alteração premium recente.
          </Typography>
        ) : (
          items.map((item, index) => (
            <Stack key={item.id} spacing={0.4}>
              <Typography variant="body2" fontWeight={700}>
                {item.action}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Usuário: {item.user_id}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Novo premium: {item.new_premium ? "Sim" : "Não"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Novo premium até: {item.new_premium_until || "-"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatAdminDate(item.created_at)}
              </Typography>

              {index < items.length - 1 ? <Divider /> : null}
            </Stack>
          ))
        )}
      </Stack>
    </AppCard>
  );
}