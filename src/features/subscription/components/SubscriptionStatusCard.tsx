import {
  Alert,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PixRoundedIcon from "@mui/icons-material/Pix";
import { Link as RouterLink } from "react-router-dom";
import { AppCard } from "../../../components/common/AppCard";
import type { UserSubscription } from "../../admin/admin.types";
import { formatDate } from "../../earnings/earnings.utils";

type Props = {
  subscription: UserSubscription | null;
  premiumActive: boolean;
  subscriptionModeEnabled: boolean;
  onCancel: () => Promise<void>;
  cancelLoading: boolean;
};

function getPlanLabel(planCode: string) {
  if (planCode.includes("monthly")) return "Mensal";
  if (planCode.includes("quarterly")) return "Trimestral";
  if (planCode.includes("semiannual")) return "Semestral";
  if (planCode.includes("annual")) return "Anual";
  return planCode;
}

export function SubscriptionStatusCard({
  subscription,
  premiumActive,
  subscriptionModeEnabled,
  onCancel,
  cancelLoading,
}: Props) {
  const isPix = subscription?.plan_code?.includes("_pix");
  const hasRecurringCard = Boolean(subscription?.is_auto_renew);

  return (
    <AppCard>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Typography variant="h6">Plano atual</Typography>

          {premiumActive ? (
            <Chip
              icon={<WorkspacePremiumRoundedIcon />}
              label="Premium ativo"
              color="success"
            />
          ) : (
            <Chip label="Free" variant="outlined" />
          )}
        </Stack>

        {subscription ? (
          <>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Plano
              </Typography>
              <Typography fontWeight={700}>
                {getPlanLabel(subscription.plan_code)}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Forma de pagamento
              </Typography>
              <Stack direction="row" spacing={1}>
                {isPix ? (
                  <Chip icon={<PixRoundedIcon />} label="PIX" variant="outlined" />
                ) : (
                  <Chip
                    icon={<CreditCardRoundedIcon />}
                    label="Cartão"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Status da assinatura
              </Typography>
              <Typography fontWeight={700}>{subscription.status}</Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Vencimento
              </Typography>
              <Typography fontWeight={700}>
                {subscription.expires_at ? formatDate(subscription.expires_at) : "-"}
              </Typography>
            </Stack>

            {hasRecurringCard ? (
              <Alert severity="info">
                Sua assinatura está com renovação automática ativa.
              </Alert>
            ) : isPix ? (
              <Alert severity="info">
                Este pagamento foi feito por PIX e não renova automaticamente.
                Para novas opções de pagamento por PIX, consulte o suporte na aba de contato.
              </Alert>
            ) : null}

            {hasRecurringCard ? (
              <Button
                variant="outlined"
                color="warning"
                onClick={onCancel}
                disabled={cancelLoading}
              >
                Cancelar renovação automática
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Typography color="text.secondary">
              Você está no plano gratuito no momento.
            </Typography>

            {subscriptionModeEnabled ? (
              <Button
                component={RouterLink}
                to="/subscription"
                variant="contained"
                color="success"
              >
                Assinar Premium
              </Button>
            ) : null}
          </>
        )}
      </Stack>
    </AppCard>
  );
}