import { Alert, Button, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
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
  NewUserPremiumPolicy,
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

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [logs, setLogs] = useState<AdminActionLogItem[]>([]);
  const [policy, setPolicy] = useState<NewUserPremiumPolicy>(emptyPolicy);
  const [massPremiumDays, setMassPremiumDays] = useState(365);

  const loadData = async () => {
    try {
      setLoading(true);

      const [nextMetrics, nextLogs, nextPolicy] = await Promise.all([
        adminProService.getMetrics(),
        adminProService.getActionLogs(),
        adminProService.getNewUserPremiumPolicy(),
      ]);

      setMetrics(nextMetrics ?? emptyMetrics);
      setLogs(nextLogs);
      setPolicy(nextPolicy ?? emptyPolicy);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar dashboard admin", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
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
                <AppCard>
                  <Stack spacing={2}>
                    <Typography variant="h6">
                      Ações globais do sistema
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Novos usuários premium por"
                          value={policy.durationDays}
                          onChange={(e) =>
                            handleSetNewUserDuration(Number(e.target.value))
                          }
                          disabled={actionLoading}
                        >
                          {premiumDurationOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={actionLoading}
                            onClick={() => handleSetNewUserPremiumPolicy(true)}
                          >
                            Ativar premium p/ novos
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            disabled={actionLoading}
                            onClick={() => handleSetNewUserPremiumPolicy(false)}
                          >
                            Revogar premium p/ novos
                          </Button>
                        </Stack>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Aplicar premium para todos os atuais"
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
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            disabled={actionLoading}
                            onClick={handleApplyPremiumToAll}
                          >
                            Dar premium para atuais
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            disabled={actionLoading}
                            onClick={handleRevokePremiumFromAll}
                          >
                            Tirar premium de atuais
                          </Button>
                        </Stack>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          disabled={actionLoading}
                          onClick={handleResetSystemData}
                        >
                          Resetar ganhos, gastos, contatos e logs
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          disabled={actionLoading}
                          onClick={handleClearAllNonAdminUsers}
                        >
                          Remover todos usuários não-admin
                        </Button>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" color="text.secondary">
                      Política atual: novos usuários entram{" "}
                      {policy.enabled ? "como premium" : "como free"} por{" "}
                      {policy.durationDays} dias.
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