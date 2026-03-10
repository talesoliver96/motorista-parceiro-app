import {
  Alert,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
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

const settingsSchema = z
  .object({
    phone: z.string().min(8, "Digite um telefone válido"),
    email: z.string().email("Digite um e-mail válido"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
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

type SettingsFormData = z.infer<typeof settingsSchema>;

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

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      phone: profile?.phone || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    reset({
      phone: profile?.phone || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
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

      if (values.email !== user.email) {
        await authService.updateEmail(values.email);
      }

      if (values.phone !== (profile?.phone || "")) {
        await profileService.updateProfileByUserId(user.id, {
          phone: values.phone,
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
            Atualize seus dados de acesso, contato e plano.
          </Typography>
        </Stack>

        <Alert severity="info">
          Status da conta: {profile?.premium ? "Premium" : "Free"}
        </Alert>

        <AppCard>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">Plano atual</Typography>

                <Typography color="text.secondary">
                  {profile?.premium
                    ? `Premium${
                        subscription?.expires_at
                          ? ` até ${formatDate(subscription.expires_at)}`
                          : ""
                      }`
                    : "Free"}
                </Typography>
              </Stack>

              <Chip
                label={profile?.premium ? "Premium" : "Free"}
                color={profile?.premium ? "success" : "default"}
              />
            </Stack>

            {subscription ? (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Plano
                      </Typography>
                      <Typography fontWeight={700}>
                        {getPlanLabel(subscription.plan_code)}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Forma de pagamento
                      </Typography>
                      <Typography fontWeight={700}>
                        {isPix ? "PIX" : "Cartão"}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Status da assinatura
                      </Typography>
                      <Typography fontWeight={700}>
                        {translateSubscriptionStatus(subscription.status)}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Vencimento
                      </Typography>
                      <Typography fontWeight={700}>
                        {subscription.expires_at
                          ? formatDate(subscription.expires_at)
                          : "-"}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {hasRecurringCard ? (
                  <>
                    <Alert severity="info">
                      Sua assinatura está com renovação automática ativa.
                    </Alert>

                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      sx={{ width: { xs: "100%", sm: "fit-content" } }}
                    >
                      Cancelar renovação automática
                    </Button>
                  </>
                ) : isPix ? (
                  <Alert severity="info">
                    Este pagamento foi feito por PIX e não renova automaticamente.
                    Para novas opções de pagamento por PIX, consulte o suporte na aba
                    de contato.
                  </Alert>
                ) : null}
              </>
            ) : (
              <Typography color="text.secondary">
                Você está no plano gratuito no momento.
              </Typography>
            )}
          </Stack>
        </AppCard>

        <AppCard>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nome"
                    fullWidth
                    value={profile?.name || ""}
                    disabled
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Telefone"
                    fullWidth
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="E-mail"
                    fullWidth
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Senha atual"
                    type="password"
                    fullWidth
                    {...register("currentPassword")}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nova senha"
                    type="password"
                    fullWidth
                    {...register("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Confirmar nova senha"
                    type="password"
                    fullWidth
                    {...register("confirmNewPassword")}
                    error={!!errors.confirmNewPassword}
                    helperText={errors.confirmNewPassword?.message}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={loading}>
                  Salvar alterações
                </Button>
              </Stack>
            </Stack>
          </form>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}