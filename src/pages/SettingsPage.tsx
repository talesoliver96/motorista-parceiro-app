import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { useAuth } from "../app/providers/AuthProvider";
import { profileService } from "../features/auth/profile.service";
import { authService } from "../features/auth/auth.service";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

const settingsSchema = z
  .object({
    phone: z.string().min(8, "Digite um telefone válido"),
    email: z.string().email("Digite um e-mail válido"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const currentPassword = values.currentPassword?.trim() ?? "";
    const newPassword = values.newPassword?.trim() ?? "";
    const confirmNewPassword = values.confirmNewPassword?.trim() ?? "";

    const wantsToChangePassword = newPassword.length > 0;

    if (wantsToChangePassword) {
      if (!currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Digite sua senha atual",
        });
      }

      if (newPassword.length < 6) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "A nova senha deve ter pelo menos 6 caracteres",
        });
      }

      if (!confirmNewPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmNewPassword"],
          message: "Confirme a nova senha",
        });
      }

      if (newPassword !== confirmNewPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmNewPassword"],
          message: "A confirmação da nova senha não confere",
        });
      }
    }
  });

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      phone: "",
      email: "",
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

  const onSubmit = async (values: SettingsFormData) => {
    try {
      setSaving(true);

      await profileService.updateMyProfile({
        phone: values.phone,
      });

      if (values.email && values.email !== user?.email) {
        await authService.updateEmail(values.email);
      }

      if (values.newPassword?.trim()) {
        await authService.verifyCurrentPassword(
          user?.email || "",
          values.currentPassword || ""
        );

        await authService.updatePassword(values.newPassword);
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
      enqueueSnackbar("Erro ao atualizar configurações", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Configurações</Typography>
          <Typography color="text.secondary">
            Atualize seus dados de acesso e contato.
          </Typography>
        </Stack>

        <Alert severity="info">
          Alterações de e-mail podem exigir confirmação, conforme a configuração
          do seu projeto no Supabase.
        </Alert>

        <AppCard>
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nome"
                  value={profile?.name || ""}
                  disabled
                  fullWidth
                  slotProps={{
                    input: {
                      sx: {
                        bgcolor: "action.disabledBackground",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Telefone"
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="E-mail"
                  type="email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Senha atual"
                  type="password"
                  placeholder="Obrigatória para trocar a senha"
                  {...register("currentPassword")}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nova senha"
                  type="password"
                  placeholder="Digite apenas se quiser trocar"
                  {...register("newPassword")}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Confirmar nova senha"
                  type="password"
                  {...register("confirmNewPassword")}
                  error={!!errors.confirmNewPassword}
                  helperText={errors.confirmNewPassword?.message}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={saving}>
                Salvar alterações
              </Button>
            </Stack>
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}