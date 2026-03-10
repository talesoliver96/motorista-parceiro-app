import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
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

const experienceOptions = [
  {
    value: "driver",
    label: "Gestão para motoristas",
    shortLabel: "Modo Driver",
    description:
      "Indicada para quem deseja acompanhar ganhos, gastos, combustível, KM e resultado operacional com uma visão especializada.",
  },
  {
    value: "basic",
    label: "Controle financeiro essencial",
    shortLabel: "Modo Essential",
    description:
      "Indicada para quem deseja uma gestão financeira simples, elegante e focada em entradas, saídas, saldo e total disponível.",
  },
] as const;

export function RegisterPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      appMode: "driver",
    },
  });

  const selectedAppMode = watch("appMode");

  const selectedOption =
    experienceOptions.find((option) => option.value === selectedAppMode) ??
    experienceOptions[0];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitting(true);

      await authService.signUp(data);

      enqueueSnackbar(
        "Conta criada com sucesso. Se o login não entrar automaticamente, faça login com seu e-mail e senha.",
        { variant: "success" }
      );

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
      <Box sx={{ maxWidth: 640, mx: "auto", width: "100%" }}>
        <AppCard>
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h4">Criar conta</Typography>
              <Typography color="text.secondary">
                Escolha a experiência ideal para o seu perfil e comece com uma
                estrutura profissional desde o primeiro acesso.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <TextField
                  label="Nome completo"
                  fullWidth
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />

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
                  helperText={errors.email?.message}
                />

                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />

                <TextField
                  select
                  label="Experiência inicial"
                  fullWidth
                  defaultValue="driver"
                  {...register("appMode")}
                  error={!!errors.appMode}
                  helperText={errors.appMode?.message}
                >
                  {experienceOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1}>
                    <Chip
                      label={selectedOption.shortLabel}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ width: "fit-content" }}
                    />

                    <Typography variant="subtitle2">
                      {selectedOption.label}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {selectedOption.description}
                    </Typography>
                  </Stack>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : "Cadastrar"}
                </Button>

                <Button component={RouterLink} to="/login">
                  Já tenho conta
                </Button>
              </Stack>
            </Box>
          </Stack>
        </AppCard>
      </Box>
    </PageContainer>
  );
}