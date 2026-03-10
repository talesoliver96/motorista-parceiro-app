import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Link, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthCard } from "../features/auth/components/AuthCard";
import { FormTextField } from "../components/common/FormTextField";
import { loginSchema, type LoginFormData } from "../features/auth/auth.schemas";
import { authService } from "../features/auth/auth.service";
import { profileService } from "../features/auth/profile.service";
import { useSnackbar } from "notistack";

export function LoginPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      setSubmitError(null);

      await authService.signIn(values);

      const session = await authService.getSession();
      const user = session?.user;

      if (!user) {
        throw new Error("Não foi possível autenticar este usuário.");
      }

      const profile = await profileService.getProfileByUserId(user.id);

      if (profile?.is_blocked) {
        await authService.signOut();
        throw new Error("Não foi possível autenticar este usuário.");
      }

      enqueueSnackbar("Login realizado com sucesso", {
        variant: "success",
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "E-mail ou senha inválidos";

      setSubmitError(message);
    }
  };

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta para acompanhar seus ganhos e gastos."
      footer={
        <Typography variant="body2" color="text.secondary">
          Ainda não tem conta?{" "}
          <Link component={RouterLink} to="/cadastro">
            Criar conta
          </Link>
        </Typography>
      }
    >
      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSubmit(onSubmit)}
      >
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <FormTextField
          name="email"
          control={control}
          label="E-mail"
          type="email"
        />

        <FormTextField
          name="password"
          control={control}
          label="Senha"
          type="password"
        />

        <Stack alignItems="flex-end">
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Esqueci minha senha
          </Link>
        </Stack>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Entrar
        </Button>
      </Stack>
    </AuthCard>
  );
}