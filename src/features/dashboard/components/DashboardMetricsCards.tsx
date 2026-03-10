import { Grid, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency } from "../../earnings/earnings.utils";
import type { AppMode } from "../../../types/database";

type Props = {
  gross: number;
  totalExpenses: number;
  net: number;
  km: number;
  earningPerKm: number | null;
  isPremium: boolean;
  appMode?: AppMode;
};

export function DashboardMetricsCards({
  gross,
  totalExpenses,
  net,
  km,
  earningPerKm,
  isPremium,
  appMode = "driver",
}: Props) {
  const isDriverMode = appMode === "driver";

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 3 : 4 }}>
        <AppCard>
          <Typography variant="body2" color="text.secondary">
            {isDriverMode ? "Ganho bruto" : "Entradas"}
          </Typography>

          <Typography variant="h5" sx={{ mt: 1 }}>
            {formatCurrency(gross)}
          </Typography>
        </AppCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 3 : 4 }}>
        <AppCard>
          <Typography variant="body2" color="text.secondary">
            {isDriverMode ? "Total de gastos" : "Saídas"}
          </Typography>

          <Typography variant="h5" sx={{ mt: 1 }}>
            {formatCurrency(totalExpenses)}
          </Typography>
        </AppCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 3 : 4 }}>
        <AppCard>
          <Typography variant="body2" color="text.secondary">
            {isDriverMode ? "Lucro líquido" : "Resultado líquido"}
          </Typography>

          <Typography
            variant="h5"
            sx={{ mt: 1 }}
            color={net >= 0 ? "success.main" : "error.main"}
          >
            {formatCurrency(net)}
          </Typography>
        </AppCard>
      </Grid>

      {isDriverMode ? (
        <>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                KM rodados
              </Typography>

              <Typography variant="h5" sx={{ mt: 1 }}>
                {km.toFixed(2)}
              </Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Ganho por KM
              </Typography>

              <Typography variant="h5" sx={{ mt: 1 }}>
                {isPremium && earningPerKm !== null
                  ? formatCurrency(earningPerKm)
                  : "Premium"}
              </Typography>
            </AppCard>
          </Grid>
        </>
      ) : null}
    </Grid>
  );
}