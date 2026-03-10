import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PixRoundedIcon from "@mui/icons-material/Pix";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { formatCurrency } from "../features/earnings/earnings.utils";
import { supabase } from "../lib/supabase";
import { useAuth } from "../app/providers/AuthProvider";

type PlanCode = "monthly" | "quarterly" | "semiannual" | "annual";
type PaymentFlow = "card_subscription" | "pix_one_time";

export function SubscriptionPage() {
  const { settings } = usePublicAppSettings();
  const { refreshProfile } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>("card_subscription");

  const params = new URLSearchParams(window.location.search);
  const success = params.get("success") === "1";
  const canceled = params.get("canceled") === "1";
  const flow = params.get("flow");

  const plans = useMemo(
    () => [
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
    ],
    [settings]
  );

  useEffect(() => {
    if (!success) return;

    let cancelled = false;

    const syncProfile = async () => {
      try {
        await refreshProfile();

        setTimeout(async () => {
          if (cancelled) return;
          await refreshProfile();
        }, 2000);
      } catch (error) {
        console.error("Erro ao atualizar profile após pagamento:", error);
      }
    };

    void syncProfile();

    return () => {
      cancelled = true;
    };
  }, [success, refreshProfile]);

  const handleSubscribe = async (planCode: PlanCode) => {
    try {
      setLoadingPlan(planCode);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("Faça login para continuar.");
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
        body: JSON.stringify({
          planCode,
          paymentFlow,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao iniciar pagamento");
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao iniciar pagamento");
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
              Escolha pagar com cartão para renovação automática. Para pagamentos via PIX, consulte o suporte na aba de contato.
            </Typography>
          </Stack>

          {success ? (
            <Alert severity="success">
              {flow === "pix"
                ? "Pagamento via PIX confirmado. Seu premium será liberado automaticamente após confirmação do Stripe."
                : "Pagamento iniciado com sucesso. Sua assinatura premium será ativada automaticamente."}
            </Alert>
          ) : null}

          {canceled ? <Alert severity="warning">Pagamento cancelado.</Alert> : null}

          <Stack spacing={1}>
            <Typography variant="h6">Forma de pagamento</Typography>

            <ToggleButtonGroup
              exclusive
              value={paymentFlow}
              onChange={(_, value) => {
                if (value) setPaymentFlow(value);
              }}
              color="primary"
            >
              <ToggleButton value="card_subscription">
                <Stack direction="row" spacing={1} alignItems="center">
                  <CreditCardRoundedIcon fontSize="small" />
                  <span>Cartão</span>
                </Stack>
              </ToggleButton>

              <ToggleButton value="pix_one_time" disabled>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PixRoundedIcon fontSize="small" />
                  <span>PIX</span>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body2" color="text.secondary">
              Cartão ativa assinatura com renovação automática.
            </Typography>

            <Alert severity="info" icon={<LockRoundedIcon />}>
              PIX está preparado no sistema, mas no momento deve ser tratado via suporte na aba de contato.
            </Alert>
          </Stack>

          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid key={plan.code} size={{ xs: 12, md: 6, lg: 3 }}>
                <AppCard sx={{ height: "100%" }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{plan.title}</Typography>
                      <Chip label="Cartão" color="primary" size="small" />
                    </Stack>

                    <Typography variant="h4" fontWeight={800}>
                      {formatCurrency(plan.price)}
                    </Typography>

                    <Typography color="text.secondary">
                      Assinatura recorrente com renovação automática.
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