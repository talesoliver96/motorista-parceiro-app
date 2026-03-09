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
import { formatCurrency, formatDate, getCurrentMonthRange } from "../features/earnings/earnings.utils";
import { reportsService, type ReportsData } from "../features/reports/reports.service";
import { useAuth } from "../app/providers/AuthProvider";
import { useSnackbar } from "notistack";
import { AppSkeleton } from "../components/common/AppSkeleton";

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

const pieColors = ["#1976d2", "#42a5f5", "#90caf9", "#1565c0", "#64b5f6", "#1e88e5"];

export function ReportsPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportsData>(emptyReportsData);

  const loadReports = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const result = await reportsService.getReportsData(
        user.id,
        startDate,
        endDate
      );

      setData(result);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar relatórios", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user, startDate, endDate]);

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Relatórios</Typography>
          <Typography color="text.secondary">
            Analise ganhos, gastos manuais, combustível automático e desempenho líquido do período.
          </Typography>
        </Stack>

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
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Ganho bruto
                  </Typography>
                  <Typography variant="h5">{formatCurrency(data.gross)}</Typography>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Gastos manuais
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(data.manualExpensesTotal)}
                  </Typography>
                </AppCard>
              </Grid>

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

              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Total de gastos
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(data.totalExpenses)}
                  </Typography>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <AppCard>
                  <Typography variant="body2" color="text.secondary">
                    Lucro líquido
                  </Typography>
                  <Typography
                    variant="h5"
                    color={data.net >= 0 ? "success.main" : "error.main"}
                  >
                    {formatCurrency(data.net)}
                  </Typography>
                </AppCard>
              </Grid>

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
                    {data.earningPerKm ? formatCurrency(data.earningPerKm) : "-"}
                  </Typography>
                </AppCard>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <AppCard sx={{ height: 380 }}>
                  <Typography variant="h6" gutterBottom>
                    Ganhos por dia da semana
                  </Typography>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.earningsByWeekday}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="gross" fill="#1976d2" radius={[8, 8, 0, 0]} />
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
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppCard>
                  <Typography variant="h6" gutterBottom>
                    Melhores dias líquidos do período
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell align="right">Bruto</TableCell>
                          <TableCell align="right">Gastos</TableCell>
                          <TableCell align="right">Líquido</TableCell>
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
                                    item.net >= 0 ? "success.main" : "error.main",
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
      </Stack>
    </PageContainer>
  );
}