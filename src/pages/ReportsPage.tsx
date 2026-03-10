import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { DashboardFilters } from "../features/dashboard/components/DashboardFilters";
import {
  formatCurrency,
  formatDate,
  getCurrentMonthRange,
} from "../features/earnings/earnings.utils";
import {
  reportsService,
  type ReportsData,
} from "../features/reports/reports.service";
import { useAuth } from "../app/providers/AuthProvider";
import { useSnackbar } from "notistack";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { PremiumLockedState } from "../components/common/PremiumLockedState";
import { isPremiumProfile } from "../features/premium/premium.utils";

const emptyReportsData: ReportsData = {
  earnings: [],
  manualExpenses: [],
  automaticFuelExpenses: [],
  allExpenses: [],
  gross: 0,
  manualExpensesTotal: 0,
  automaticFuelTotal: 0,
  totalExpenses: 0,
  net: 0,
  totalKm: 0,
  earningPerKm: null,
  earningsByWeekday: [],
  expensesByCategory: [],
  topNetDays: [],
};

const pieColors = [
  "#1976d2",
  "#42a5f5",
  "#90caf9",
  "#1565c0",
  "#64b5f6",
  "#1e88e5",
];

export function ReportsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isPremium = isPremiumProfile(profile);
  const appMode = profile?.app_mode ?? "driver";
  const isDriverMode = appMode === "driver";

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportsData>(emptyReportsData);

  useEffect(() => {
    if (authLoading) return;

    if (!isPremium) {
      setLoading(false);
      setData(emptyReportsData);
      return;
    }

    let cancelled = false;

    const loadReports = async () => {
      try {
        setLoading(true);

        const result = await reportsService.getReportsData(startDate, endDate);

        if (cancelled) return;
        setData(result);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          enqueueSnackbar("Erro ao carregar relatórios", {
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isPremium, startDate, endDate, enqueueSnackbar]);

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">
            {isDriverMode ? "Relatórios" : "Análises"}
          </Typography>
          <Typography color="text.secondary">
            {isDriverMode
              ? "Analise ganhos, gastos, combustível automático e desempenho líquido do período."
              : "Analise entradas, saídas e resultado líquido do período com uma visão financeira mais avançada."}
          </Typography>
        </Stack>

        {authLoading ? (
          <AppSkeleton />
        ) : !isPremium ? (
          <PremiumLockedState
            title={
              isDriverMode
                ? "Relatórios avançados são premium"
                : "Análises avançadas são premium"
            }
            description={
              isDriverMode
                ? "Libere gráficos, melhores dias líquidos, custo automático de combustível e visão avançada do seu desempenho."
                : "Libere gráficos, melhores dias líquidos e visão analítica mais completa da sua movimentação financeira."
            }
          />
        ) : (
          <>
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
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 4 : 4 }}>
                    <AppCard>
                      <Typography variant="body2" color="text.secondary">
                        {isDriverMode ? "Ganho bruto" : "Entradas"}
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(data.gross)}
                      </Typography>
                    </AppCard>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 4 : 4 }}>
                    <AppCard>
                      <Typography variant="body2" color="text.secondary">
                        Gastos manuais
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(data.manualExpensesTotal)}
                      </Typography>
                    </AppCard>
                  </Grid>

                  {isDriverMode ? (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                      <AppCard>
                        <Typography variant="body2" color="text.secondary">
                          Combustível automático
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(data.automaticFuelTotal)}
                        </Typography>
                      </AppCard>
                    </Grid>
                  ) : null}

                  <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 4 : 4 }}>
                    <AppCard>
                      <Typography variant="body2" color="text.secondary">
                        Total de gastos
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(data.totalExpenses)}
                      </Typography>
                    </AppCard>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, lg: isDriverMode ? 4 : 4 }}>
                    <AppCard>
                      <Typography variant="body2" color="text.secondary">
                        {isDriverMode ? "Lucro líquido" : "Resultado líquido"}
                      </Typography>
                      <Typography
                        variant="h5"
                        color={data.net >= 0 ? "success.main" : "error.main"}
                      >
                        {formatCurrency(data.net)}
                      </Typography>
                    </AppCard>
                  </Grid>

                  {isDriverMode ? (
                    <>
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <AppCard>
                          <Typography variant="body2" color="text.secondary">
                            KM total
                          </Typography>
                          <Typography variant="h5">
                            {data.totalKm > 0 ? data.totalKm.toFixed(2) : "-"}
                          </Typography>
                        </AppCard>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <AppCard>
                          <Typography variant="body2" color="text.secondary">
                            Ganho por KM
                          </Typography>
                          <Typography variant="h5">
                            {data.earningPerKm
                              ? formatCurrency(data.earningPerKm)
                              : "-"}
                          </Typography>
                        </AppCard>
                      </Grid>
                    </>
                  ) : null}
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, lg: 7 }}>
                    <AppCard sx={{ height: 380 }}>
                      <Typography variant="h6" gutterBottom>
                        {isDriverMode
                          ? "Ganhos por dia da semana"
                          : "Entradas por dia da semana"}
                      </Typography>

                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.earningsByWeekday}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(Number(value))
                            }
                          />
                          <Bar
                            dataKey="gross"
                            fill="#1976d2"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </AppCard>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 5 }}>
                    <AppCard sx={{ height: 380 }}>
                      <Typography variant="h6" gutterBottom>
                        Gastos por categoria
                      </Typography>

                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.expensesByCategory}
                            dataKey="amount"
                            nameKey="category"
                            outerRadius={95}
                            label
                          >
                            {data.expensesByCategory.map((_, index) => (
                              <Cell
                                key={index}
                                fill={pieColors[index % pieColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(Number(value))
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </AppCard>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <AppCard>
                      <Typography variant="h6" gutterBottom>
                        {isDriverMode
                          ? "Melhores dias líquidos do período"
                          : "Melhores resultados líquidos do período"}
                      </Typography>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Data</TableCell>
                              <TableCell align="right">
                                {isDriverMode ? "Bruto" : "Entradas"}
                              </TableCell>
                              <TableCell align="right">Gastos</TableCell>
                              <TableCell align="right">
                                {isDriverMode ? "Líquido" : "Resultado"}
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {data.topNetDays.length ? (
                              data.topNetDays.map((item) => (
                                <TableRow key={item.date}>
                                  <TableCell>{formatDate(item.date)}</TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(item.gross)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(item.expenses)}
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      color:
                                        item.net >= 0
                                          ? "success.main"
                                          : "error.main",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {formatCurrency(item.net)}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4}>
                                  <Typography color="text.secondary">
                                    Nenhum dado suficiente no período.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AppCard>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </Stack>
    </PageContainer>
  );
}