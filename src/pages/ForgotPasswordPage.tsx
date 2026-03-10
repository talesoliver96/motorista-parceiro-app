import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Link, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { AuthCard } from "../features/auth/components/AuthCard";
import { FormTextField } from "../components/common/FormTextField";
import { authService } from "../features/auth/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setSubmitError(null);
      setSuccessMessage(null);

      await authService.sendPasswordResetEmail(values.email);

      setSuccessMessage(
        "Se este e-mail existir, enviamos um link para redefinição de senha."
      );
    } catch (error) {
      console.error(error);
      setSubmitError("Não foi possível enviar o e-mail de recuperação.");
    }
  };

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <Typography variant="body2" color="text.secondary">
          Lembrou sua senha?{" "}
          <Link component={RouterLink} to="/login">
            Voltar ao login
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

        <FormTextField
          name="email"
          control={control}
          label="E-mail"
          type="email"
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Enviar link
        </Button>
      </Stack>
    </AuthCard>
  );
}