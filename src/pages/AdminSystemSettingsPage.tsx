import {
  Alert,
  Button,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useSnackbar } from "notistack";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { AppSkeleton } from "../components/common/AppSkeleton";
import { PremiumLockedState } from "../components/common/PremiumLockedState";
import { useAdminSystemSettings } from "../features/admin/useAdminSystemSettings";
import { useAuth } from "../app/providers/AuthProvider";
import { isAdminProfile } from "../features/admin/admin.utils";

export function AdminSystemSettingsPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isAdmin = isAdminProfile(profile);

  const {
    loading,
    load,
    subscriptionMode,
    setSubscriptionMode,
    saveSubscriptionMode,
    maintenanceMode,
    setMaintenanceMode,
    maintenanceMessage,
    setMaintenanceMessage,
    saveMaintenance,
    pricing,
    setPricing,
    savePricing,
  } = useAdminSystemSettings();

  if (!isAdmin) {
    return <PremiumLockedState />;
  }

  const handleSaveSubscriptionMode = async () => {
    try {
      await saveSubscriptionMode();
      enqueueSnackbar("Configuração de assinatura atualizada", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao salvar assinatura", {
        variant: "error",
      });
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      await saveMaintenance();
      enqueueSnackbar("Modo manutenção atualizado", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao salvar manutenção", {
        variant: "error",
      });
    }
  };

  const handleSavePricing = async () => {
    try {
      await savePricing();
      enqueueSnackbar("Preços e IDs Stripe atualizados", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao salvar preços premium", {
        variant: "error",
      });
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
            <Typography variant="h4">Gerenciar assinatura</Typography>
            <Typography color="text.secondary">
              Controle o modo de assinatura, manutenção, preços premium e IDs Stripe.
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void load()}
            disabled={loading}
          >
            Recarregar
          </Button>
        </Stack>

        <Alert severity="warning">
          Esta área impacta cobrança, experiência de compra e disponibilidade do sistema.
        </Alert>

        {loading ? (
          <AppSkeleton />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AppCard>
                <Stack spacing={2}>
                  <Typography variant="h6">Sistema de assinatura</Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={subscriptionMode}
                        onChange={(e) => setSubscriptionMode(e.target.checked)}
                      />
                    }
                    label="Ativar sistema de assinatura"
                  />

                  <Typography variant="body2" color="text.secondary">
                    Quando desativado, o fluxo comercial de assinatura fica indisponível
                    para os usuários.
                  </Typography>

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => void handleSaveSubscriptionMode()}
                    >
                      Salvar
                    </Button>
                  </Stack>
                </Stack>
              </AppCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <AppCard>
                <Stack spacing={2}>
                  <Typography variant="h6">Modo manutenção</Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                      />
                    }
                    label="Ativar modo manutenção"
                  />

                  <TextField
                    label="Mensagem de manutenção"
                    fullWidth
                    multiline
                    minRows={3}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => void handleSaveMaintenance()}
                    >
                      Salvar manutenção
                    </Button>
                  </Stack>
                </Stack>
              </AppCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AppCard>
                <Stack spacing={3}>
                  <Typography variant="h6">Preços Premium</Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Preço mensal"
                        type="number"
                        fullWidth
                        value={pricing.monthly_price}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            monthly_price: Number(e.target.value),
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Preço trimestral"
                        type="number"
                        fullWidth
                        value={pricing.quarterly_price}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            quarterly_price: Number(e.target.value),
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Preço semestral"
                        type="number"
                        fullWidth
                        value={pricing.semiannual_price}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            semiannual_price: Number(e.target.value),
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Preço anual"
                        type="number"
                        fullWidth
                        value={pricing.annual_price}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            annual_price: Number(e.target.value),
                          })
                        }
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h6">IDs Stripe</Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Stripe Price ID mensal"
                        fullWidth
                        value={pricing.stripe_price_monthly}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            stripe_price_monthly: e.target.value,
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Stripe Price ID trimestral"
                        fullWidth
                        value={pricing.stripe_price_quarterly}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            stripe_price_quarterly: e.target.value,
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Stripe Price ID semestral"
                        fullWidth
                        value={pricing.stripe_price_semiannual}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            stripe_price_semiannual: e.target.value,
                          })
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Stripe Price ID anual"
                        fullWidth
                        value={pricing.stripe_price_annual}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            stripe_price_annual: e.target.value,
                          })
                        }
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => void handleSavePricing()}
                    >
                      Salvar preços
                    </Button>
                  </Stack>
                </Stack>
              </AppCard>
            </Grid>
          </Grid>
        )}
      </Stack>
    </PageContainer>
  );
}