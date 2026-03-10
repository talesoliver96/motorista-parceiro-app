import {
  Alert,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

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
  AdminUserListItem,
  NewUserPremiumPolicy,
  PremiumHistoryItem,
} from "../features/admin/admin.types";
import { AdminMetricsCards } from "../features/admin/components/AdminMetricsCards";
import { AdminActionLogsCard } from "../features/admin/components/AdminActionLogsCard";
import { PremiumHistoryCard } from "../features/admin/components/PremiumHistoryCard";
import { formatCurrency } from "../features/earnings/earnings.utils";

const emptyMetrics: AdminMetrics = {
  totalUsers: 0,
  premiumUsers: 0,
  adminUsers: 0,
  blockedUsers: 0,
  usersCreatedToday: 0,
  usersCreatedLast7Days: 0,
  usersLoggedRecently: 0,
  monthlyPremiumPrice: 5,
  potentialMrr: 0,
  potentialArr: 0,
};

const emptyPolicy: NewUserPremiumPolicy = {
  enabled: true,
  durationDays: 365,
};

const premiumDurationOptions = [
  { label: "1 mês", value: 30 },
  { label: "3 meses", value: 90 },
  { label: "6 meses", value: 180 },
  { label: "1 ano", value: 365 },
];

const LOGS_PAGE_SIZE = 10;
const PREMIUM_HISTORY_PAGE_SIZE = 10;

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [logs, setLogs] = useState<AdminActionLogItem[]>([]);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [premiumHistory, setPremiumHistory] = useState<PremiumHistoryItem[]>([]);
  const [policy, setPolicy] = useState<NewUserPremiumPolicy>(emptyPolicy);
  const [massPremiumDays, setMassPremiumDays] = useState(365);

  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalItems, setLogsTotalItems] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);

  const [premiumHistoryPage, setPremiumHistoryPage] = useState(1);
  const [premiumHistoryTotalPages, setPremiumHistoryTotalPages] = useState(1);
  const [premiumHistoryTotalItems, setPremiumHistoryTotalItems] = useState(0);
  const [premiumHistoryLoading, setPremiumHistoryLoading] = useState(false);

  const loadBaseData = async () => {
    try {
      setLoading(true);

      const [nextMetrics, nextPolicy, nextUsers] = await Promise.all([
        adminProService.getMetrics(),
        adminProService.getNewUserPremiumPolicy(),
        adminProService.listUsers(""),
      ]);

      setMetrics(nextMetrics ?? emptyMetrics);
      setPolicy(nextPolicy ?? emptyPolicy);
      setUsers(nextUsers);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar dashboard admin", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLogsPage = async (page: number) => {
    try {
      setLogsLoading(true);

      const result = await adminProService.getActionLogs(page, LOGS_PAGE_SIZE);

      setLogs(result.items);
      setLogsPage(result.page);
      setLogsTotalPages(result.totalPages);
      setLogsTotalItems(result.total);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar logs administrativos", {
        variant: "error",
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const loadPremiumHistoryPage = async (page: number) => {
    try {
      setPremiumHistoryLoading(true);

      const result = await adminProService.getPremiumHistory(
        page,
        PREMIUM_HISTORY_PAGE_SIZE
      );

      setPremiumHistory(result.items);
      setPremiumHistoryPage(result.page);
      setPremiumHistoryTotalPages(result.totalPages);
      setPremiumHistoryTotalItems(result.total);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar histórico premium", {
        variant: "error",
      });
    } finally {
      setPremiumHistoryLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadBaseData(),
      loadLogsPage(1),
      loadPremiumHistoryPage(1),
    ]);
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    void loadData();
  }, [isAdmin]);

  const handleSetNewUserPremiumPolicy = async (enabled: boolean) => {
    try {
      setActionLoading(true);
      await adminProService.setNewUserPremiumPolicy(enabled, policy.durationDays);

      enqueueSnackbar("Política de novos usuários atualizada", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao atualizar política", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetNewUserDuration = async (durationDays: number) => {
    try {
      setActionLoading(true);
      await adminProService.setNewUserPremiumPolicy(policy.enabled, durationDays);

      enqueueSnackbar("Duração padrão atualizada", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao atualizar duração", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyPremiumToAll = async () => {
    try {
      setActionLoading(true);
      await adminProService.applyPremiumToAll(massPremiumDays);

      enqueueSnackbar("Premium aplicado para todos os usuários atuais", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao aplicar premium em massa", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePremiumFromAll = async () => {
    try {
      setActionLoading(true);
      await adminProService.revokePremiumFromAll();

      enqueueSnackbar("Premium revogado de todos os usuários atuais", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao revogar premium em massa", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetSystemData = async () => {
    try {
      setActionLoading(true);
      await adminProService.resetSystemData();

      enqueueSnackbar("Dados do sistema resetados", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao resetar dados", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAllNonAdminUsers = async () => {
    try {
      setActionLoading(true);
      await adminProService.clearAllNonAdminUsers();

      enqueueSnackbar("Todos os usuários não-admin foram removidos", {
        variant: "success",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao limpar usuários", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return <PremiumLockedState />;
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
              Acompanhe métricas do sistema, histórico premium e ações administrativas.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => void loadData()}
              disabled={loading || actionLoading || logsLoading || premiumHistoryLoading}
            >
              Atualizar
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={() => adminProService.exportUsersCsv(users)}
              disabled={!users.length}
            >
              Exportar CSV
            </Button>

            <Button
              component={RouterLink}
              to="/admin/users"
              variant="contained"
              startIcon={<PeopleRoundedIcon />}
              onClick={() => navigate("/admin/users")}
            >
              Gerenciar usuários
            </Button>
          </Stack>
        </Stack>

        <AppCard>
          <Stack spacing={1}>
            <Typography variant="h6">Configurações do sistema</Typography>
            <Alert severity="warning">
              Área administrativa com acesso sensível.
            </Alert>
          </Stack>
        </AppCard>

        {loading ? (
          <AppSkeleton />
        ) : (
          <>
            <Stack spacing={1}>
              <Typography variant="h6">Métricas financeiras do SaaS</Typography>
              <Typography variant="body2" color="text.secondary">
                Preço premium mensal: {formatCurrency(metrics.monthlyPremiumPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MRR potencial: {formatCurrency(metrics.potentialMrr)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ARR potencial: {formatCurrency(metrics.potentialArr)}
              </Typography>
            </Stack>

            <AdminMetricsCards metrics={metrics} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <AppCard>
                  <Stack spacing={2}>
                    <Typography variant="h6">Política e ações globais</Typography>

                    <TextField
                      select
                      fullWidth
                      label="Duração padrão para novos usuários"
                      value={policy.durationDays}
                      onChange={(e) =>
                        void handleSetNewUserDuration(Number(e.target.value))
                      }
                      disabled={actionLoading}
                    >
                      {premiumDurationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => void handleSetNewUserPremiumPolicy(true)}
                        disabled={actionLoading}
                      >
                        Ativar premium p/ novos
                      </Button>

                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => void handleSetNewUserPremiumPolicy(false)}
                        disabled={actionLoading}
                      >
                        Revogar premium p/ novos
                      </Button>
                    </Stack>

                    <TextField
                      select
                      fullWidth
                      label="Duração do premium em massa"
                      value={massPremiumDays}
                      onChange={(e) => setMassPremiumDays(Number(e.target.value))}
                      disabled={actionLoading}
                    >
                      {premiumDurationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() => void handleApplyPremiumToAll()}
                        disabled={actionLoading}
                      >
                        Dar premium para atuais
                      </Button>

                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => void handleRevokePremiumFromAll()}
                        disabled={actionLoading}
                      >
                        Tirar premium de atuais
                      </Button>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => void handleResetSystemData()}
                        disabled={actionLoading}
                      >
                        Resetar ganhos, gastos, contatos e logs
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => void handleClearAllNonAdminUsers()}
                        disabled={actionLoading}
                      >
                        Remover todos usuários não-admin
                      </Button>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Política atual: novos usuários entram{" "}
                      {policy.enabled ? "como premium" : "como free"} por{" "}
                      {policy.durationDays} dias.
                    </Typography>
                  </Stack>
                </AppCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <AdminActionLogsCard
                  items={logs}
                  page={logsPage}
                  totalPages={logsTotalPages}
                  totalItems={logsTotalItems}
                  loading={logsLoading}
                  onPageChange={(page) => void loadLogsPage(page)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <PremiumHistoryCard
                  items={premiumHistory}
                  page={premiumHistoryPage}
                  totalPages={premiumHistoryTotalPages}
                  totalItems={premiumHistoryTotalItems}
                  loading={premiumHistoryLoading}
                  onPageChange={(page) => void loadPremiumHistoryPage(page)}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}