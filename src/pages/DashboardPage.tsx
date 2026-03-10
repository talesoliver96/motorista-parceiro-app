import { useEffect, useMemo, useState } from "react";
import { Button, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { DashboardFilters } from "../features/dashboard/components/DashboardFilters";
import { RecentActivityCard } from "../features/dashboard/components/RecentActivityCard";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { useAuth } from "../app/providers/AuthProvider";
import { useSnackbar } from "notistack";
import { getCurrentMonthRange, formatCurrency } from "../features/earnings/earnings.utils";
import {
  secureDashboardService,
  type SecureDashboardSummary,
} from "../features/dashboard/secure-dashboard.service";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { subscriptionService } from "../features/subscription/subscription.service";
import { SubscriptionStatusCard } from "../features/subscription/components/SubscriptionStatusCard";
import type { UserSubscription } from "../features/admin/admin.types";
import { supabase } from "../lib/supabase";

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
  const { user, profile, refreshProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { settings } = usePublicAppSettings();

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SecureDashboardSummary>(emptySummary);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAll = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [summaryData, subscriptionData] = await Promise.all([
        secureDashboardService.getSummary(startDate, endDate),
        subscriptionService.getCurrentUserSubscription(user.id),
      ]);

      setSummary(summaryData);
      setSubscription(subscriptionData);
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
    void loadAll();
  }, [user, startDate, endDate]);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao cancelar assinatura");
      }

      enqueueSnackbar("Renovação automática cancelada com sucesso", {
        variant: "success",
      });

      await refreshProfile();
      await loadAll();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao cancelar assinatura",
        { variant: "error" }
      );
    } finally {
      setCancelLoading(false);
    }
  };

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
            <Typography variant="h4">
              Olá, {profile?.name || "motorista"} 👋
            </Typography>
            <Typography color="text.secondary">
              Acompanhe seu desempenho financeiro no período selecionado.
            </Typography>
          </Stack>

          {!summary.premiumActive && settings.subscriptionMode.enabled ? (
            <Button
              component={RouterLink}
              to="/subscription"
              variant="contained"
              color="success"
            >
              Assinar Premium
            </Button>
          ) : null}
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <SubscriptionStatusCard
                subscription={subscription}
                premiumActive={summary.premiumActive}
                subscriptionModeEnabled={settings.subscriptionMode.enabled}
                onCancel={handleCancelSubscription}
                cancelLoading={cancelLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Ganho bruto
                    </Typography>
                    <Typography variant="h5">{formatCurrency(summary.gross)}</Typography>
                  </AppCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Total de gastos
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(summary.totalExpenses)}
                    </Typography>
                  </AppCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Lucro líquido
                    </Typography>
                    <Typography
                      variant="h5"
                      color={summary.net >= 0 ? "success.main" : "error.main"}
                    >
                      {formatCurrency(summary.net)}
                    </Typography>
                  </AppCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Gastos manuais
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(summary.manualExpenses)}
                    </Typography>
                  </AppCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <AppCard>
                    <Typography variant="body2" color="text.secondary">
                      Combustível automático
                    </Typography>
                    <Typography variant="h5">
                      {summary.premiumActive
                        ? formatCurrency(summary.automaticFuel)
                        : "Premium"}
                    </Typography>
                  </AppCard>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RecentActivityCard items={[]} />
            </Grid>
          </Grid>
        )}
      </Stack>
    </PageContainer>
  );
}