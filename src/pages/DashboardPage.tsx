import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/common/PageContainer";
import { useAuth } from "../app/providers/AuthProvider";
import {
  dashboardService,
  type DashboardData,
} from "../features/dashboard/dashboard.service";
import { DashboardFilters } from "../features/dashboard/components/DashboardFilters";
import { DashboardMetricsCards } from "../features/dashboard/components/DashboardMetricsCards";
import { EarningsByDayChart } from "../features/dashboard/components/EarningsByDayChart";
import { RecentActivityCard } from "../features/dashboard/components/RecentActivityCard";
import { AppCard } from "../components/common/AppCard";
import { formatCurrency } from "../features/earnings/earnings.utils";
import { useSnackbar } from "notistack";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { isPremiumProfile } from "../features/premium/premium.utils";

const emptyDashboardData: DashboardData = {
  earnings: [],
  expenses: [],
  gross: 0,
  totalExpenses: 0,
  net: 0,
  km: 0,
  earningPerKm: null,
  chartData: [],
  projection: null,
  recentActivity: [],
};

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isPremium = isPremiumProfile(profile);

  const now = useMemo(() => dayjs(), []);
  const [startDate, setStartDate] = useState(
    now.startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    now.endOf("month").format("YYYY-MM-DD")
  );

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(emptyDashboardData);

  const loadDashboard = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const result = await dashboardService.getDashboardData(
        user.id,
        startDate,
        endDate,
        isPremium
      );

      setData(result);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar dashboard", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user, startDate, endDate, isPremium]);

  const firstName =
    profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "parceiro";

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4">Olá, {firstName} 👋</Typography>
            <Typography color="text.secondary">
              Veja seu desempenho financeiro no período selecionado.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={() => navigate("/earnings")}>
              Adicionar ganho
            </Button>

            <Button variant="outlined" onClick={() => navigate("/expenses")}>
              Adicionar gasto
            </Button>
          </Stack>
        </Stack>

        {isPremium ? (
          <Alert severity="success">
            Sua conta premium libera projeção, ganho por KM e combustível automático.
          </Alert>
        ) : (
          <Alert severity="info">
            Projeção, ganho por KM, combustível automático e relatórios são recursos premium.
          </Alert>
        )}

        <DashboardFilters
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
        />

        {loading ? (
          <AppSkeleton />
        ) : (
          <>
            <DashboardMetricsCards
              gross={data.gross}
              totalExpenses={data.totalExpenses}
              net={data.net}
              km={data.km}
              earningPerKm={data.earningPerKm}
              isPremium={isPremium}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <EarningsByDayChart data={data.chartData} />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <RecentActivityCard items={data.recentActivity} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Projeção do mês
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {isPremium && data.projection
                      ? formatCurrency(data.projection)
                      : "Premium"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Disponível para usuários premium no mês atual completo.
                  </Typography>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Resultado do período
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ mt: 1 }}
                    color={data.net >= 0 ? "success.main" : "error.main"}
                  >
                    {formatCurrency(data.net)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Lucro líquido = ganho bruto - gastos.
                  </Typography>
                </AppCard>
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}