import { zodResolver } from "@hookform/resolvers/zod";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
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
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useAuth } from "../app/providers/AuthProvider";
import { adminProService } from "../features/admin/admin.pro.service";
import type {
  AdminMetrics,
  AdminUserListItem,
  AdminUserUpdatePayload,
} from "../features/admin/admin.types";
import {
  formatAdminDate,
  getBlockedLabel,
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
    isBlocked: z.boolean(),
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

const emptyMetrics: AdminMetrics = {
  totalUsers: 0,
  premiumUsers: 0,
  adminUsers: 0,
  blockedUsers: 0,
  usersCreatedToday: 0,
  usersCreatedLast7Days: 0,
  usersLoggedRecently: 0,
};

export function AdminUsersPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);

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
      isBlocked: false,
    },
  });

  const premiumMode = watch("premiumMode");

  const loadData = async (nextSearch = search) => {
    try {
      setLoading(true);

      const [usersData, metricsData] = await Promise.all([
        adminProService.listUsers(nextSearch),
        adminProService.getMetrics(),
      ]);

      setUsers(usersData);
      setMetrics(metricsData ?? emptyMetrics);
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

    void loadData("");
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
      premiumUntil: user.premium_until ? user.premium_until.slice(0, 10) : "",
      isAdmin: user.is_admin,
      isBlocked: user.is_blocked,
    });

    setDialogOpen(true);
  };

  const handleDeleteRequest = (user: AdminUserListItem) => {
    setUserToDelete(user);
    setDeleteOpen(true);
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
        isBlocked: values.isBlocked,
      };

      await adminProService.updateUser(payload);

      enqueueSnackbar("Usuário atualizado com sucesso", {
        variant: "success",
      });

      setDialogOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao atualizar usuário", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await adminProService.deleteUser(userToDelete.id);

      enqueueSnackbar("Usuário excluído com sucesso", {
        variant: "success",
      });

      setDeleteOpen(false);
      setUserToDelete(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao excluir usuário", {
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const totals = useMemo(() => {
    return {
      total: users.length,
      premium: users.filter((item) => item.premium).length,
      admin: users.filter((item) => item.is_admin).length,
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
            Gerencie conta, premium, senha, e-mail, bloqueio e permissões dos usuários.
          </Typography>
        </Stack>

        <Alert severity="warning">
          Esta área tem acesso sensível. Use apenas para administração do sistema.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Total de usuários
              </Typography>
              <Typography variant="h5">{metrics.totalUsers || totals.total}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Usuários premium
              </Typography>
              <Typography variant="h5">{metrics.premiumUsers || totals.premium}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Administradores
              </Typography>
              <Typography variant="h5">{metrics.adminUsers || totals.admin}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Bloqueados
              </Typography>
              <Typography variant="h5">{metrics.blockedUsers}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Criados hoje
              </Typography>
              <Typography variant="h5">{metrics.usersCreatedToday}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Criados nos últimos 7 dias
              </Typography>
              <Typography variant="h5">{metrics.usersCreatedLast7Days}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Logaram recentemente
              </Typography>
              <Typography variant="h5">{metrics.usersLoggedRecently}</Typography>
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

            <Button variant="contained" onClick={() => loadData(search)}>
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
                    <TableCell>Conta</TableCell>
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
                          label={getBlockedLabel(user.is_blocked)}
                          color={user.is_blocked ? "error" : "success"}
                          variant={user.is_blocked ? "filled" : "outlined"}
                        />
                      </TableCell>
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
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                          <IconButton onClick={() => openEditDialog(user)}>
                            <EditRoundedIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() => handleDeleteRequest(user)}
                          >
                            <DeleteRoundedIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!users.length ? (
                    <TableRow>
                      <TableCell colSpan={9}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isBlocked"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Status do usuário"
                    value={field.value ? "blocked" : "active"}
                    onChange={(e) => field.onChange(e.target.value === "blocked")}
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="blocked">Bloqueado</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="Excluir usuário"
        description="Tem certeza que deseja excluir este usuário? Essa ação apaga login, perfil, ganhos, gastos e mensagens relacionadas."
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}