import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { AdvancedMovementFilters } from "../components/common/AdvancedMovementFilters";
import { useAuth } from "../app/providers/AuthProvider";

import {
  dashboardService,
  type DashboardData,
} from "../features/dashboard/dashboard.service";
import { DashboardFilters } from "../features/dashboard/components/DashboardFilters";
import { DashboardMetricsCards } from "../features/dashboard/components/DashboardMetricsCards";
import { EarningsByDayChart } from "../features/dashboard/components/EarningsByDayChart";
import { RecentActivityCard } from "../features/dashboard/components/RecentActivityCard";
import { formatCurrency } from "../features/earnings/earnings.utils";
import { isPremiumProfile } from "../features/premium/premium.utils";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { getRecentActivity, groupEarningsByDay } from "../features/dashboard/dashboard.utils";
import {
  buildUniqueOptions,
  emptyAdvancedMovementFilters,
  filterEarnings,
  filterExpenseItems,
  type AdvancedMovementFilters as AdvancedMovementFiltersState,
} from "../utils/movementFilters";

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
  const { settings } = usePublicAppSettings();

  const profilePremium = isPremiumProfile(profile);
  const walletEnabled = profile?.wallet_enabled ?? false;
  const walletBalance = Number(profile?.wallet_balance ?? 0);
  const appMode = profile?.app_mode ?? "driver";
  const isDriverMode = appMode === "driver";

  const now = useMemo(() => dayjs(), []);
  const [startDate, setStartDate] = useState(
    now.startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    now.endOf("month").format("YYYY-MM-DD")
  );

  const [filters, setFilters] = useState<AdvancedMovementFiltersState>(
    emptyAdvancedMovementFilters
  );

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!user) {
        if (!cancelled) {
          setDetails(emptyDashboardData);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const result = await dashboardService.getDashboardData(
          user.id,
          startDate,
          endDate,
          profilePremium
        );

        if (cancelled) return;
        setDetails(result);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
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

  const categoryOptions = useMemo(() => {
    return buildUniqueOptions([
      ...details.earnings.map((item) => item.platform ?? ""),
      ...details.expenses.map((item) => item.category),
    ]);
  }, [details]);

  const filteredEarnings = useMemo(
    () => filterEarnings(details.earnings, filters),
    [details.earnings, filters]
  );

  const filteredExpenses = useMemo(
    () => filterExpenseItems(details.expenses, filters),
    [details.expenses, filters]
  );

  const displayGross = useMemo(
    () => filteredEarnings.reduce((acc, item) => acc + Number(item.gross_amount || 0), 0),
    [filteredEarnings]
  );

  const displayExpenses = useMemo(
    () => filteredExpenses.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [filteredExpenses]
  );

  const displayNet = useMemo(
    () => displayGross - displayExpenses,
    [displayGross, displayExpenses]
  );

  const displayKm = useMemo(
    () => filteredEarnings.reduce((acc, item) => acc + Number(item.km_traveled || 0), 0),
    [filteredEarnings]
  );

  const earningPerKm = useMemo(() => {
    if (!isDriverMode || !profilePremium || displayKm <= 0) return null;
    return displayGross / displayKm;
  }, [isDriverMode, profilePremium, displayGross, displayKm]);

  const chartData = useMemo(
    () => groupEarningsByDay(filteredEarnings),
    [filteredEarnings]
  );

  const recentActivity = useMemo(
    () => getRecentActivity(filteredEarnings, filteredExpenses),
    [filteredEarnings, filteredExpenses]
  );

  const automaticFuelFiltered = useMemo(
    () =>
      filteredExpenses
        .filter((item) => item.source === "automatic_fuel")
        .reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [filteredExpenses]
  );

  const manualExpensesFiltered = useMemo(
    () =>
      filteredExpenses
        .filter((item) => item.source === "manual")
        .reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [filteredExpenses]
  );

  const totalAvailable = walletEnabled ? walletBalance + displayNet : displayNet;

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
              {isDriverMode
                ? "Veja seu desempenho financeiro com filtros avançados e leitura mais precisa."
                : "Acompanhe seu resultado financeiro com filtros avançados e visão clara do período."}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {!profilePremium && settings.subscriptionMode.enabled ? (
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
              {isDriverMode ? "Adicionar ganho" : "Adicionar entrada"}
            </Button>

            <Button variant="outlined" onClick={() => navigate("/expenses")}>
              Adicionar gasto
            </Button>
          </Stack>
        </Stack>

        {isDriverMode ? (
          profilePremium ? (
            <Alert severity="success">
              Sua conta premium libera projeção, ganho por KM, combustível automático e leitura operacional mais avançada.
            </Alert>
          ) : (
            <Alert severity="info">
              Projeção, ganho por KM e combustível automático são recursos premium.
            </Alert>
          )
        ) : (
          <Alert severity="info">
            Você está usando a experiência essencial, com foco em entradas, gastos, saldo e total disponível.
          </Alert>
        )}

        <AppCard>
          <Stack spacing={2}>
            <DashboardFilters
              startDate={startDate}
              endDate={endDate}
              onChangeStartDate={setStartDate}
              onChangeEndDate={setEndDate}
            />

            <AdvancedMovementFilters
              title="Filtro avançado do dashboard"
              categoryLabel="Categoria / origem"
              categoryOptions={categoryOptions}
              value={filters}
              onChange={setFilters}
            />
          </Stack>
        </AppCard>

        {loading ? (
          <AppSkeleton />
        ) : (
          <>
            <DashboardMetricsCards
              gross={displayGross}
              totalExpenses={displayExpenses}
              net={displayNet}
              km={isDriverMode ? displayKm : 0}
              earningPerKm={isDriverMode ? earningPerKm : null}
              isPremium={profilePremium && isDriverMode}
              appMode={appMode}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <EarningsByDayChart data={chartData} appMode={appMode} />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <RecentActivityCard items={recentActivity} appMode={appMode} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Gastos manuais considerados
                  </Typography>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {formatCurrency(manualExpensesFiltered)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {isDriverMode
                      ? "Inclui os gastos manuais do recorte filtrado."
                      : "Representa as saídas registradas no recorte filtrado."}
                  </Typography>
                </AppCard>
              </Grid>

              {isDriverMode ? (
                <Grid size={{ xs: 12, md: 4 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Combustível automático restante
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {profilePremium ? formatCurrency(automaticFuelFiltered) : "Premium"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Valor automático restante dentro do filtro atual.
                    </Typography>
                  </AppCard>
                </Grid>
              ) : null}

              <Grid size={{ xs: 12, md: isDriverMode ? 4 : 8 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Resultado do período
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ mt: 1 }}
                    color={displayNet >= 0 ? "success.main" : "error.main"}
                  >
                    {formatCurrency(displayNet)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {isDriverMode
                      ? "Lucro líquido filtrado = ganhos filtrados - gastos filtrados."
                      : "Resultado líquido filtrado = entradas filtradas - saídas filtradas."}
                  </Typography>
                </AppCard>
              </Grid>

              {walletEnabled ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Saldo da carteira
                    </Typography>

                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {formatCurrency(walletBalance)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Valor disponível informado manualmente nas configurações.
                    </Typography>
                  </AppCard>
                </Grid>
              ) : null}

              {walletEnabled ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Total disponível
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ mt: 1 }}
                      color={totalAvailable >= 0 ? "success.main" : "error.main"}
                    >
                      {formatCurrency(totalAvailable)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Total disponível = saldo da carteira + resultado filtrado.
                    </Typography>
                  </AppCard>
                </Grid>
              ) : null}
            </Grid>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}