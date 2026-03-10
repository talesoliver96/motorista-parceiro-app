import {
  Alert,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { useAuth } from "../app/providers/AuthProvider";
import { profileService } from "../features/auth/profile.service";
import { authService } from "../features/auth/auth.service";
import { subscriptionService } from "../features/subscription/subscription.service";
import type { UserSubscription } from "../features/admin/admin.types";
import { formatDate } from "../features/earnings/earnings.utils";
import { supabase } from "../lib/supabase";
import type { AppMode } from "../types/database";

const settingsSchema = z
  .object({
    phone: z.string().min(8, "Digite um telefone válido"),
    email: z.string().email("Digite um e-mail válido"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
    appMode: z.enum(["driver", "basic"]),
    walletEnabled: z.boolean(),
    walletBalance: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return 0;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }, z.number()),
  })
  .superRefine((values, ctx) => {
    const wantsToChangePassword = !!values.newPassword?.trim();

    if (!wantsToChangePassword) return;

    if (!values.currentPassword?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Informe sua senha atual",
      });
    }

    if ((values.newPassword?.trim()?.length ?? 0) < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter pelo menos 6 caracteres",
      });
    }

    if (!values.confirmNewPassword?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Confirme a nova senha",
      });
    }

    if (values.newPassword !== values.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "As senhas não coincidem",
      });
    }
  });

type SettingsFormInput = z.input<typeof settingsSchema>;
type SettingsFormData = z.output<typeof settingsSchema>;

function translateSubscriptionStatus(status?: string) {
  switch (status) {
    case "active":
      return "Ativa";
    case "canceled":
      return "Cancelada";
    case "past_due":
      return "Pagamento pendente";
    case "incomplete":
      return "Incompleta";
    case "trialing":
      return "Em teste";
    case "unpaid":
      return "Não paga";
    default:
      return status || "-";
  }
}

function getPlanLabel(planCode?: string) {
  if (!planCode) return "-";
  if (planCode.includes("monthly")) return "Mensal";
  if (planCode.includes("quarterly")) return "Trimestral";
  if (planCode.includes("semiannual")) return "Semestral";
  if (planCode.includes("annual")) return "Anual";
  return planCode;
}

function getAppModeLabel(appMode?: AppMode) {
  return appMode === "basic"
    ? "Controle financeiro essencial"
    : "Gestão para motoristas";
}

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SettingsFormInput, unknown, SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      phone: profile?.phone || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      appMode: profile?.app_mode || "driver",
      walletEnabled: profile?.wallet_enabled || false,
      walletBalance: profile?.wallet_balance || 0,
    },
  });

  const walletEnabled = watch("walletEnabled");
  const appMode = watch("appMode");

  useEffect(() => {
    reset({
      phone: profile?.phone || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      appMode: profile?.app_mode || "driver",
      walletEnabled: profile?.wallet_enabled || false,
      walletBalance: profile?.wallet_balance || 0,
    });
  }, [profile, user, reset]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;

      try {
        const data = await subscriptionService.getCurrentUserSubscription(user.id);
        setSubscription(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadSubscription();
  }, [user]);

  const onSubmit = async (values: SettingsFormData) => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (values.newPassword?.trim()) {
        await authService.verifyCurrentPassword(
          values.email,
          values.currentPassword?.trim() || ""
        );
      }

      if (values.email !== user.email) {
        await authService.updateEmail(values.email);
      }

      const shouldUpdateProfile =
        values.phone !== (profile?.phone || "") ||
        values.appMode !== (profile?.app_mode || "driver") ||
        values.walletEnabled !== (profile?.wallet_enabled || false) ||
        values.walletBalance !== (profile?.wallet_balance || 0);

      if (shouldUpdateProfile) {
        await profileService.updateProfileByUserId(user.id, {
          phone: values.phone,
          appMode: values.appMode,
          walletEnabled: values.walletEnabled,
          walletBalance: values.walletBalance,
        });
      }

      if (values.newPassword?.trim()) {
        await authService.updatePassword(values.newPassword.trim());
      }

      await refreshProfile();

      enqueueSnackbar("Configurações atualizadas com sucesso", {
        variant: "success",
      });

      reset({
        phone: values.phone,
        email: values.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        appMode: values.appMode,
        walletEnabled: values.walletEnabled,
        walletBalance: values.walletBalance,
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao salvar alterações",
        {
          variant: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

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

      const response = await fetch(
        `${supabaseUrl}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao cancelar assinatura");
      }

      enqueueSnackbar("Renovação automática cancelada com sucesso", {
        variant: "success",
      });

      const updated = user
        ? await subscriptionService.getCurrentUserSubscription(user.id)
        : null;

      setSubscription(updated);
      await refreshProfile();
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

  const hasRecurringCard = Boolean(subscription?.is_auto_renew);
  const isPix = Boolean(subscription?.plan_code?.includes("_pix"));

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Configurações</Typography>
          <Typography color="text.secondary">
            Atualize seus dados de acesso, contato, experiência de uso e plano.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Status da conta
                </Typography>

                <Chip
                  label={profile?.premium ? "Premium" : "Free"}
                  color={profile?.premium ? "success" : "default"}
                  sx={{ width: "fit-content" }}
                />
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Plano atual
                </Typography>

                <Typography variant="h6">
                  {profile?.premium
                    ? `Premium${
                        subscription?.expires_at
                          ? ` até ${formatDate(subscription.expires_at)}`
                          : ""
                      }`
                    : "Free"}
                </Typography>
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Experiência ativa
                </Typography>

                <Typography variant="h6">
                  {getAppModeLabel(profile?.app_mode)}
                </Typography>
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <AppCard>
              <Stack spacing={2}>
                <Typography variant="h6">Dados de acesso e perfil</Typography>

                <TextField
                  label="Telefone"
                  fullWidth
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />

                <TextField
                  label="E-mail"
                  type="email"
                  fullWidth
                  {...register("email")}
                  error={!!errors.email}
                  helperText={
                    errors.email?.message ||
                    "Se alterar o e-mail, poderá ser necessário confirmar a mudança."
                  }
                />

                <TextField
                  select
                  label="Experiência do aplicativo"
                  fullWidth
                  {...register("appMode")}
                  error={!!errors.appMode}
                  helperText={
                    errors.appMode?.message ||
                    "Você pode alternar entre a experiência de motorista e o controle financeiro essencial."
                  }
                >
                  <MenuItem value="driver">Gestão para motoristas</MenuItem>
                  <MenuItem value="basic">Controle financeiro essencial</MenuItem>
                </TextField>

                <Alert severity="info">
                  {appMode === "driver"
                    ? "A experiência para motoristas mantém recursos como KM, combustível e indicadores operacionais."
                    : "A experiência essencial prioriza entradas, saídas, saldo e acompanhamento financeiro simplificado."}
                </Alert>
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <AppCard>
              <Stack spacing={2}>
                <Typography variant="h6">Saldo / carteira</Typography>

                <Alert severity="info">
                  O saldo representa um valor disponível já existente em conta ou
                  em caixa. Ele complementa a leitura do seu resultado financeiro,
                  sem alterar seus lançamentos de ganhos.
                </Alert>

                <FormControlLabel
                  control={
                    <Switch
                      checked={walletEnabled}
                      onChange={(e) =>
                        setValue("walletEnabled", e.target.checked, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  }
                  label="Usar saldo / carteira"
                />

                <TextField
                  label="Saldo atual"
                  type="number"
                  fullWidth
                  disabled={!walletEnabled}
                  inputProps={{ step: "0.01" }}
                  {...register("walletBalance", { valueAsNumber: true })}
                  error={!!errors.walletBalance}
                  helperText={
                    errors.walletBalance?.message ||
                    (walletEnabled
                      ? "Informe o valor disponível que deseja acompanhar no painel."
                      : "Ative a opção acima para utilizar o saldo no dashboard.")
                  }
                />
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <AppCard>
              <Stack spacing={2}>
                <Typography variant="h6">Segurança da conta</Typography>

                <TextField
                  label="Senha atual"
                  type="password"
                  fullWidth
                  {...register("currentPassword")}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                />

                <TextField
                  label="Nova senha"
                  type="password"
                  fullWidth
                  {...register("newPassword")}
                  error={!!errors.newPassword}
                  helperText={
                    errors.newPassword?.message ||
                    "Preencha apenas se desejar alterar a senha."
                  }
                />

                <TextField
                  label="Confirmar nova senha"
                  type="password"
                  fullWidth
                  {...register("confirmNewPassword")}
                  error={!!errors.confirmNewPassword}
                  helperText={errors.confirmNewPassword?.message}
                />
              </Stack>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <AppCard>
              <Stack spacing={2}>
                <Typography variant="h6">Assinatura e pagamento</Typography>

                {subscription ? (
                  <>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Plano"
                          value={getPlanLabel(subscription.plan_code)}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Forma de pagamento"
                          value={isPix ? "PIX" : "Cartão"}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Status da assinatura"
                          value={translateSubscriptionStatus(subscription.status)}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Vencimento"
                          value={
                            subscription.expires_at
                              ? formatDate(subscription.expires_at)
                              : "-"
                          }
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>

                    {hasRecurringCard ? (
                      <>
                        <Alert severity="warning">
                          Sua assinatura está com renovação automática ativa.
                        </Alert>

                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => void handleCancelSubscription()}
                          disabled={cancelLoading}
                        >
                          Cancelar renovação automática
                        </Button>
                      </>
                    ) : isPix ? (
                      <Alert severity="info">
                        Este pagamento foi feito por PIX e não renova
                        automaticamente. Para novas opções de pagamento por PIX,
                        consulte o suporte na aba de contato.
                      </Alert>
                    ) : null}
                  </>
                ) : (
                  <Alert severity="info">
                    Você está no plano gratuito no momento.
                  </Alert>
                )}
              </Stack>
            </AppCard>
          </Grid>
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            Salvar alterações
          </Button>
        </Stack>
      </Stack>
    </PageContainer>
  );
}