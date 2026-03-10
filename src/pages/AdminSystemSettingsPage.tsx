import {
  Button,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { useAdminSystemSettings } from "../features/admin/useAdminSystemSettings";

export function AdminSystemSettingsPage() {
  const {
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

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h4">Configurações do Sistema</Typography>

        <AppCard>
          <Stack spacing={2}>
            <Typography variant="h6">Sistema de assinatura</Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Switch
                checked={subscriptionMode}
                onChange={(e) => setSubscriptionMode(e.target.checked)}
              />
              <Typography>Ativar sistema de assinatura</Typography>
            </Stack>

            <Button variant="contained" onClick={saveSubscriptionMode}>
              Salvar
            </Button>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2}>
            <Typography variant="h6">Modo manutenção</Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Switch
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <Typography>Ativar modo manutenção</Typography>
            </Stack>

            <TextField
              label="Mensagem de manutenção"
              fullWidth
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
            />

            <Button variant="contained" onClick={saveMaintenance}>
              Salvar manutenção
            </Button>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2}>
            <Typography variant="h6">Preços Premium</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mensal"
                  value={pricing.monthly_price}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      monthly_price: Number(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Trimestral"
                  value={pricing.quarterly_price}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      quarterly_price: Number(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Semestral"
                  value={pricing.semiannual_price}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      semiannual_price: Number(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Anual"
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

            <TextField
              label="Stripe Monthly Price ID"
              fullWidth
              value={pricing.stripe_price_monthly}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  stripe_price_monthly: e.target.value,
                })
              }
            />

            <TextField
              label="Stripe Quarterly Price ID"
              fullWidth
              value={pricing.stripe_price_quarterly}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  stripe_price_quarterly: e.target.value,
                })
              }
            />

            <TextField
              label="Stripe Semiannual Price ID"
              fullWidth
              value={pricing.stripe_price_semiannual}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  stripe_price_semiannual: e.target.value,
                })
              }
            />

            <TextField
              label="Stripe Annual Price ID"
              fullWidth
              value={pricing.stripe_price_annual}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  stripe_price_annual: e.target.value,
                })
              }
            />

            <Button variant="contained" onClick={savePricing}>
              Salvar preços
            </Button>
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}