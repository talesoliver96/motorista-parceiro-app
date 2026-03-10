import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { PremiumLockedState } from "../components/common/PremiumLockedState";
import { useAuth } from "../app/providers/AuthProvider";
import { adminProService } from "../features/admin/admin.pro.service";
import { isAdminProfile } from "../features/admin/admin.utils";
import type {
  AdminActionLogItem,
  AdminMetrics,
} from "../features/admin/admin.types";
import { AdminMetricsCards } from "../features/admin/components/AdminMetricsCards";
import { AdminActionLogsCard } from "../features/admin/components/AdminActionLogsCard";
import { useSnackbar } from "notistack";

const emptyMetrics: AdminMetrics = {
  totalUsers: 0,
  premiumUsers: 0,
  adminUsers: 0,
  blockedUsers: 0,
  usersCreatedToday: 0,
  usersCreatedLast7Days: 0,
  usersLoggedRecently: 0,
};

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [logs, setLogs] = useState<AdminActionLogItem[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);

        const [nextMetrics, nextLogs] = await Promise.all([
          adminProService.getMetrics(),
          adminProService.getActionLogs(),
        ]);

        if (cancelled) return;

        setMetrics(nextMetrics ?? emptyMetrics);
        setLogs(nextLogs);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          enqueueSnackbar("Erro ao carregar dashboard admin", {
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, enqueueSnackbar]);

  if (!isAdmin) {
    return (
      <PageContainer>
        <PremiumLockedState
          title="Acesso restrito"
          description="Essa área é exclusiva para administradores."
        />
      </PageContainer>
    );
  }

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
            <Typography variant="h4">Dashboard Admin</Typography>
            <Typography color="text.secondary">
              Acompanhe métricas do sistema e gerencie usuários.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            startIcon={<PeopleRoundedIcon />}
            onClick={() => navigate("/admin/users")}
          >
            Gerenciar usuários
          </Button>
        </Stack>

        <Alert severity="warning">
          Área administrativa com acesso sensível.
        </Alert>

        {loading ? (
          <AppSkeleton />
        ) : (
          <>
            <AdminMetricsCards metrics={metrics} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <AppCard sx={{ height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Resumo operacional
                  </Typography>

                  <Stack spacing={1.2}>
                    <Typography variant="body2" color="text.secondary">
                      Usuários premium ativos: {metrics.premiumUsers}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Usuários bloqueados: {metrics.blockedUsers}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Novos cadastros hoje: {metrics.usersCreatedToday}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Novos cadastros nos últimos 7 dias: {metrics.usersCreatedLast7Days}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Logins recentes: {metrics.usersLoggedRecently}
                    </Typography>
                  </Stack>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <AdminActionLogsCard items={logs} />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}