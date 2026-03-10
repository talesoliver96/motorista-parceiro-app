import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { formatCurrency } from "../features/earnings/earnings.utils";
import { supabase } from "../lib/supabase";

type PlanCode = "monthly" | "quarterly" | "semiannual" | "annual";

export function SubscriptionPage() {
  const { settings } = usePublicAppSettings();
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);

  const plans = [
    {
      code: "monthly" as const,
      title: "Mensal",
      price: settings.premiumPricing.monthlyPrice,
    },
    {
      code: "quarterly" as const,
      title: "Trimestral",
      price: settings.premiumPricing.quarterlyPrice,
    },
    {
      code: "semiannual" as const,
      title: "Semestral",
      price: settings.premiumPricing.semiannualPrice,
    },
    {
      code: "annual" as const,
      title: "Anual",
      price: settings.premiumPricing.annualPrice,
    },
  ];

  const handleSubscribe = async (planCode: PlanCode) => {
    try {
      setLoadingPlan(planCode);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("Faça login para assinar.");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ planCode }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao iniciar assinatura");
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao iniciar assinatura");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!settings.subscriptionMode.enabled) {
    return (
      <PageContainer>
        <Alert severity="info">
          O modo assinatura ainda não está ativo no sistema.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="lg" disableGutters>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h4">Assinatura Premium</Typography>
            <Typography color="text.secondary">
              Libere relatórios avançados, cálculo automático de combustível, R$/KM e R$/hora.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid key={plan.code} size={{ xs: 12, md: 6, lg: 3 }}>
                <AppCard sx={{ height: "100%" }}>
                  <Stack spacing={2}>
                    <Typography variant="h6">{plan.title}</Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {formatCurrency(plan.price)}
                    </Typography>
                    <Typography color="text.secondary">
                      Acesso premium conforme plano escolhido.
                    </Typography>
                    <Box>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSubscribe(plan.code)}
                        disabled={loadingPlan === plan.code}
                      >
                        Assinar
                      </Button>
                    </Box>
                  </Stack>
                </AppCard>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </PageContainer>
  );
}