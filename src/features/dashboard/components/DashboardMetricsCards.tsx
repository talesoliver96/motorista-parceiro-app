import { Grid, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency } from "../../earnings/earnings.utils";

type Props = {
  gross: number;
  totalExpenses: number;
  net: number;
  km: number;
  earningPerKm: number | null;
  isPremium: boolean;
};

export function DashboardMetricsCards({
  gross,
  totalExpenses,
  net,
  km,
  earningPerKm,
  isPremium,
}: Props) {
  const items = [
    {
      label: "Ganho bruto",
      value: formatCurrency(gross),
    },
    {
      label: "Gastos",
      value: formatCurrency(totalExpenses),
    },
    {
      label: "Lucro líquido",
      value: formatCurrency(net),
    },
    {
      label: "KM rodados",
      value: km > 0 ? km.toFixed(1) : "-",
    },
    {
      label: "Ganho por KM",
      value: isPremium && earningPerKm ? formatCurrency(earningPerKm) : "Premium",
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 4 }}>
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