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
  registerSchema,
  type RegisterFormData,
} from "../features/auth/auth.schemas";
import { authService } from "../features/auth/auth.service";
import { useSnackbar } from "notistack";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export function RegisterPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitting(true);

      await authService.signUp(data);

      enqueueSnackbar("Conta criada com sucesso. Se o login não entrar automaticamente, faça login com seu e-mail e senha.", {
        variant: "success",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível criar a conta", {
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
            <Typography variant="h5">Criar conta</Typography>

            <Typography variant="body2" color="text.secondary">
              Cadastre-se para começar a controlar seus resultados.
            </Typography>

            <TextField
              label="Nome"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Telefone"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

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
              {submitting ? <CircularProgress size={22} /> : "Cadastrar"}
            </Button>

            <Button component={RouterLink} to="/login" variant="text">
              Já tenho conta
            </Button>
          </Stack>
        </AppCard>
      </Box>
    </PageContainer>
  );
}