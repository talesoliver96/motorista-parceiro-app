import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Link, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { AuthCard } from "../features/auth/components/AuthCard";
import { FormTextField } from "../components/common/FormTextField";
import { authService } from "../features/auth/auth.service";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a nova senha"),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "A confirmação não confere",
      });
    }
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      setSubmitError(null);

      await authService.updatePassword(values.password);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      setSubmitError("Não foi possível redefinir a senha.");
    }
  };

  return (
    <AuthCard
      title="Definir nova senha"
      subtitle="Crie sua nova senha de acesso."
      footer={
        <Typography variant="body2" color="text.secondary">
          Voltar para o{" "}
          <Link component={RouterLink} to="/login">
            login
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <FormTextField
          name="password"
          control={control}
          label="Nova senha"
          type="password"
        />

        <FormTextField
          name="confirmPassword"
          control={control}
          label="Confirmar nova senha"
          type="password"
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Salvar nova senha
        </Button>
      </Stack>
    </AuthCard>
  );
}