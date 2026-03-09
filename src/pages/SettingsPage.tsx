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

const settingsSchema = z.object({
  phone: z.string().min(8, "Digite um telefone válido"),
  email: z.email("Digite um e-mail válido"),
  password: z.string().optional(),
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
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      phone: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    reset({
      phone: profile?.phone || "",
      email: user?.email || "",
      password: "",
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

      if (values.password?.trim()) {
        await authService.updatePassword(values.password);
      }

      await refreshProfile();

      enqueueSnackbar("Configurações atualizadas com sucesso", {
        variant: "success",
      });

      reset({
        phone: values.phone,
        email: values.email,
        password: "",
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
                  label="Nova senha"
                  type="password"
                  placeholder="Digite apenas se quiser trocar"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
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