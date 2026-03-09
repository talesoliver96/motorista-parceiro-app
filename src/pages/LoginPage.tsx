import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { AppCard } from "../components/common/AppCard";
import { PageContainer } from "../components/common/PageContainer";
import {
  loginSchema,
  type LoginFormData,
} from "../features/auth/auth.schemas";
import { authService } from "../features/auth/auth.service";
import { useSnackbar } from "notistack";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

export function LoginPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitting(true);

      await authService.signIn(data);

      enqueueSnackbar("Login realizado com sucesso", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("E-mail ou senha inválidos", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Box
        sx={{
          minHeight: "80vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AppCard sx={{ width: "100%", maxWidth: 420 }}>
          <Stack
            component="form"
            spacing={2}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Typography variant="h5">Entrar</Typography>

            <Typography variant="body2" color="text.secondary">
              Faça login para acessar seus ganhos e gastos.
            </Typography>

            <TextField
              label="E-mail"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Senha"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={22} /> : "Entrar"}
            </Button>

            <Button component={RouterLink} to="/cadastro" variant="text">
              Criar conta
            </Button>
          </Stack>
        </AppCard>
      </Box>
    </PageContainer>
  );
}