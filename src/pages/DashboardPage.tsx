import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { useAuth } from "../app/providers/AuthProvider";

import {
  dashboardService,
  type DashboardData,
} from "../features/dashboard/dashboard.service";
import {
  secureDashboardService,
  type SecureDashboardSummary,
} from "../features/dashboard/secure-dashboard.service";
import { DashboardFilters } from "../features/dashboard/components/DashboardFilters";
import { DashboardMetricsCards } from "../features/dashboard/components/DashboardMetricsCards";
import { EarningsByDayChart } from "../features/dashboard/components/EarningsByDayChart";
import { RecentActivityCard } from "../features/dashboard/components/RecentActivityCard";
import { formatCurrency } from "../features/earnings/earnings.utils";
import { isPremiumProfile } from "../features/premium/premium.utils";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";

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

const emptySummary: SecureDashboardSummary = {
  gross: 0,
  manualExpenses: 0,
  automaticFuel: 0,
  totalExpenses: 0,
  net: 0,
  totalKm: 0,
  premiumActive: false,
};

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { settings } = usePublicAppSettings();

  const profilePremium = isPremiumProfile(profile);

  const now = useMemo(() => dayjs(), []);
  const [startDate, setStartDate] = useState(
    now.startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    now.endOf("month").format("YYYY-MM-DD")
  );

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SecureDashboardSummary>(emptySummary);
  const [details, setDetails] = useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!user) {
        if (!cancelled) {
          setSummary(emptySummary);
          setDetails(emptyDashboardData);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const [summaryResult, detailsResult] = await Promise.allSettled([
          secureDashboardService.getSummary(startDate, endDate),
          dashboardService.getDashboardData(
            user.id,
            startDate,
            endDate,
            profilePremium
          ),
        ]);

        if (cancelled) return;

        let hasError = false;

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
        } else {
          hasError = true;
          setSummary(emptySummary);
          console.error(summaryResult.reason);
        }

        if (detailsResult.status === "fulfilled") {
          setDetails(detailsResult.value);
        } else {
          hasError = true;
          setDetails(emptyDashboardData);
          console.error(detailsResult.reason);
        }

        if (hasError) {
          enqueueSnackbar("Parte dos dados do dashboard não pôde ser carregada.", {
            variant: "warning",
          });
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setSummary(emptySummary);
          setDetails(emptyDashboardData);

          enqueueSnackbar("Erro ao carregar dashboard", {
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user, startDate, endDate, profilePremium, enqueueSnackbar]);

  const firstName =
    profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "parceiro";

  const premiumActive = summary.premiumActive || profilePremium;
  const earningPerKm =
    premiumActive && summary.totalKm > 0 ? summary.gross / summary.totalKm : null;

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
            {!premiumActive && settings.subscriptionMode.enabled ? (
              <Button
                component={RouterLink}
                to="/subscription"
                variant="contained"
                color="success"
              >
                Assinar Premium
              </Button>
            ) : null}

            <Button variant="contained" onClick={() => navigate("/earnings")}>
              Adicionar ganho
            </Button>

            <Button variant="outlined" onClick={() => navigate("/expenses")}>
              Adicionar gasto
            </Button>
          </Stack>
        </Stack>

        {premiumActive ? (
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
              gross={summary.gross}
              totalExpenses={summary.totalExpenses}
              net={summary.net}
              km={summary.totalKm}
              earningPerKm={earningPerKm}
              isPremium={premiumActive}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <EarningsByDayChart data={details.chartData} />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <RecentActivityCard items={details.recentActivity} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Gastos manuais
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {formatCurrency(summary.manualExpenses)}
                  </Typography>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Combustível automático
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {premiumActive
                      ? formatCurrency(summary.automaticFuel)
                      : "Premium"}
                  </Typography>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Resultado do período
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ mt: 1 }}
                    color={summary.net >= 0 ? "success.main" : "error.main"}
                  >
                    {formatCurrency(summary.net)}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Projeção do mês
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {premiumActive && details.projection !== null
                      ? formatCurrency(details.projection)
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
                    Faixa selecionada
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {dayjs(startDate).format("DD/MM/YYYY")} até{" "}
                    {dayjs(endDate).format("DD/MM/YYYY")}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Os indicadores acima usam resumo seguro do período selecionado.
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