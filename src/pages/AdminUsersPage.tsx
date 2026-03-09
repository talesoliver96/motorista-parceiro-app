import { zodResolver } from "@hookform/resolvers/zod";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Button,
  Chip,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { AppDialog } from "../components/common/AppDialog";
import { useAuth } from "../app/providers/AuthProvider";
import { adminService } from "../features/admin/admin.service";
import type {
  AdminUserListItem,
  AdminUserUpdatePayload,
} from "../features/admin/admin.types";
import {
  formatAdminDate,
  getPremiumLabel,
  isAdminProfile,
} from "../features/admin/admin.utils";
import { PremiumLockedState } from "../components/common/PremiumLockedState";

const adminUserSchema = z
  .object({
    name: z.string().min(1, "Digite o nome"),
    phone: z.string().optional(),
    email: z.string().email("Digite um e-mail válido"),
    password: z.string().optional(),
    premiumMode: z.enum(["free", "days", "until_date"]),
    premiumDays: z.coerce.number().optional(),
    premiumUntil: z.string().optional(),
    isAdmin: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.password?.trim() && values.password.trim().length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    if (values.premiumMode === "days") {
      const days = Number(values.premiumDays ?? 0);
      if (!days || days <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["premiumDays"],
          message: "Informe uma quantidade de dias válida",
        });
      }
    }

    if (values.premiumMode === "until_date" && !values.premiumUntil) {
      ctx.addIssue({
        code: "custom",
        path: ["premiumUntil"],
        message: "Informe a data final do premium",
      });
    }
  });

type AdminUserFormValues = z.infer<typeof adminUserSchema>;

export function AdminUsersPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      premiumMode: "free",
      premiumDays: undefined,
      premiumUntil: "",
      isAdmin: false,
    },
  });

  const premiumMode = watch("premiumMode");

  const loadUsers = async (nextSearch = search) => {
    try {
      setLoading(true);
      const data = await adminService.listUsers(nextSearch);
      setUsers(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar usuários", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    void loadUsers("");
  }, [isAdmin]);

  const openEditDialog = (user: AdminUserListItem) => {
    setSelectedUser(user);

    reset({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
      premiumMode: user.premium ? "until_date" : "free",
      premiumDays: undefined,
      premiumUntil: user.premium_until
        ? user.premium_until.slice(0, 10)
        : "",
      isAdmin: user.is_admin,
    });

    setDialogOpen(true);
  };

  const onSubmit = async (values: AdminUserFormValues) => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const payload: AdminUserUpdatePayload = {
        userId: selectedUser.id,
        name: values.name.trim(),
        phone: values.phone?.trim() || "",
        email: values.email.trim(),
        password: values.password?.trim() || "",
        premiumMode: values.premiumMode,
        premiumDays: values.premiumDays,
        premiumUntil: values.premiumUntil,
        isAdmin: values.isAdmin,
      };

      await adminService.updateUser(payload);

      enqueueSnackbar("Usuário atualizado com sucesso", {
        variant: "success",
      });

      setDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao atualizar usuário", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const totals = useMemo(() => {
    const premiumCount = users.filter((item) => item.premium).length;
    const adminCount = users.filter((item) => item.is_admin).length;

    return {
      total: users.length,
      premium: premiumCount,
      admin: adminCount,
    };
  }, [users]);

  if (!isAdmin) {
    return (
      <PageContainer>
        <PremiumLockedState
          title="Acesso restrito"
          description="Essa área é exclusiva para administradores."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Administração de usuários</Typography>
          <Typography color="text.secondary">
            Gerencie conta, premium, senha, email e permissões dos usuários.
          </Typography>
        </Stack>

        <Alert severity="warning">
          Esta área tem acesso sensível. Use apenas para administração do sistema.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Total de usuários
              </Typography>
              <Typography variant="h5">{totals.total}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Usuários premium
              </Typography>
              <Typography variant="h5">{totals.premium}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Administradores
              </Typography>
              <Typography variant="h5">{totals.admin}</Typography>
            </AppCard>
          </Grid>
        </Grid>

        <AppCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              label="Buscar usuário"
              placeholder="Digite nome ou e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: 420, width: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button variant="contained" onClick={() => loadUsers(search)}>
              Buscar
            </Button>
          </Stack>
        </AppCard>

        <AppCard>
          {loading ? (
            <Typography>Carregando usuários...</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell>Último login</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getPremiumLabel(user)}
                          color={user.premium ? "success" : "default"}
                          variant={user.premium ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={user.is_admin ? "Sim" : "Não"}
                          color={user.is_admin ? "warning" : "default"}
                          variant={user.is_admin ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>{formatAdminDate(user.created_at)}</TableCell>
                      <TableCell>{formatAdminDate(user.last_sign_in_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEditDialog(user)}>
                          <EditRoundedIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!users.length ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography color="text.secondary">
                          Nenhum usuário encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AppCard>
      </Stack>

      <AppDialog
        open={dialogOpen}
        onClose={() => {
          if (saving) return;
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        title="Editar usuário"
        actions={
          <DialogActions sx={{ px: 0 }}>
            <Button
              onClick={() => {
                if (saving) return;
                setDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              Salvar
            </Button>
          </DialogActions>
        }
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Nome"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
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

            <Grid size={{ xs: 12 }}>
              <TextField
                label="E-mail"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nova senha"
                type="password"
                placeholder="Preencha só se quiser trocar"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="premiumMode"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Status premium"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <MenuItem value="free">Free</MenuItem>
                    <MenuItem value="days">Premium por dias</MenuItem>
                    <MenuItem value="until_date">Premium até data</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {premiumMode === "days" ? (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Quantidade de dias"
                  type="number"
                  {...register("premiumDays")}
                  error={!!errors.premiumDays}
                  helperText={errors.premiumDays?.message}
                />
              </Grid>
            ) : null}

            {premiumMode === "until_date" ? (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Premium até"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("premiumUntil")}
                  error={!!errors.premiumUntil}
                  helperText={errors.premiumUntil?.message}
                />
              </Grid>
            ) : null}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isAdmin"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="É administrador?"
                    value={field.value ? "yes" : "no"}
                    onChange={(e) => field.onChange(e.target.value === "yes")}
                  >
                    <MenuItem value="no">Não</MenuItem>
                    <MenuItem value="yes">Sim</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </AppDialog>
    </PageContainer>
  );
}