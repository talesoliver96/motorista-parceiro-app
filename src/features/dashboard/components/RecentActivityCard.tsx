import { Chip, Divider, Stack, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency, formatDate } from "../../earnings/earnings.utils";

type Props = {
  items: Array<{
    id: string;
    type: "earning" | "expense";
    title: string;
    date: string;
    amount: number;
  }>;
};

export function RecentActivityCard({ items }: Props) {
  return (
    <AppCard sx={{ height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Atividade recente
      </Typography>

      <Stack spacing={1.5}>
        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma movimentação no período.
          </Typography>
        ) : (
          items.map((item, index) => (
            <Stack key={item.id} spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Stack spacing={0.3}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(item.date)}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    size="small"
                    label={item.type === "earning" ? "Ganho" : "Gasto"}
                    color={item.type === "earning" ? "success" : "default"}
                    variant="outlined"
                  />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={item.type === "earning" ? "success.main" : "text.primary"}
                  >
                    {item.type === "earning" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </Typography>
                </Stack>
              </Stack>

              {index < items.length - 1 ? <Divider /> : null}
            </Stack>
          ))
        )}
      </Stack>
    </AppCard>
  );
}