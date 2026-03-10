import { Grid, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import type { AdminMetrics } from "../admin.types";

type Props = {
  metrics: AdminMetrics;
};

export function AdminMetricsCards({ metrics }: Props) {
  const items = [
    {
      label: "Total de usuários",
      value: metrics.totalUsers,
    },
    {
      label: "Premium ativos",
      value: metrics.premiumUsers,
    },
    {
      label: "Administradores",
      value: metrics.adminUsers,
    },
    {
      label: "Bloqueados",
      value: metrics.blockedUsers,
    },
    {
      label: "Criados hoje",
      value: metrics.usersCreatedToday,
    },
    {
      label: "Criados nos últimos 7 dias",
      value: metrics.usersCreatedLast7Days,
    },
    {
      label: "Logins recentes",
      value: metrics.usersLoggedRecently,
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <AppCard sx={{ height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {item.value}
            </Typography>
          </AppCard>
        </Grid>
      ))}
    </Grid>
  );
}