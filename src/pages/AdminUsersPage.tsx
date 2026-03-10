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
  Pagination,
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
import { useEffect, useState } from "react";
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
  UserListFilter,
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
    premiumDays: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }, z.number().optional()),
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

type AdminUserFormInput = z.input<typeof adminUserSchema>;
type AdminUserFormValues = z.output<typeof adminUserSchema>;

const emptyMetrics: AdminMetrics = {
  totalUsers: 0,
  premiumUsers: 0,
  adminUsers: 0,
  blockedUsers: 0,
  usersCreatedToday: 0,
  usersCreatedLast7Days: 0,
  usersLoggedRecently: 0,
  monthlyPremiumPrice: 5,
  potentialMrr: 0,
  potentialArr: 0,
};

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isAdmin = isAdminProfile(profile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filter, setFilter] = useState<UserListFilter>("all");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUserFormInput, unknown, AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
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

  const loadUsers = async (
    nextPage = page,
    nextSearch = appliedSearch,
    nextFilter = filter
  ) => {
    try {
      setLoading(true);

      const [usersResult, metricsData] = await Promise.all([
        adminProService.listUsers(nextSearch, nextPage, PAGE_SIZE, nextFilter),
        adminProService.getMetrics(),
      ]);

      setUsers(usersResult.items);
      setTotalUsers(usersResult.total);
      setTotalPages(usersResult.totalPages);
      setPage(usersResult.page);
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

    void loadUsers(1, "", "all");
  }, [isAdmin]);

  const handleSearch = async () => {
    setPage(1);
    setAppliedSearch(searchInput);
    await loadUsers(1, searchInput, filter);
  };

  const handleChangeFilter = async (value: UserListFilter) => {
    setFilter(value);
    setPage(1);
    await loadUsers(1, appliedSearch, value);
  };

  const handleChangePage = async (nextPage: number) => {
    await loadUsers(nextPage, appliedSearch, filter);
  };

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
    setDeleteConfirmText("");
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

      await loadUsers(page, appliedSearch, filter);
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

    if (deleteConfirmText.trim() !== userToDelete.email.trim()) {
      enqueueSnackbar("Digite o e-mail exato do usuário para confirmar", {
        variant: "warning",
      });
      return;
    }

    try {
      setDeleting(true);

      await adminProService.deleteUser(userToDelete.id);

      enqueueSnackbar("Usuário excluído com sucesso", {
        variant: "success",
      });

      setDeleteOpen(false);
      setUserToDelete(null);
      setDeleteConfirmText("");

      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      await loadUsers(nextPage, appliedSearch, filter);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao excluir usuário", {
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <PremiumLockedState />;
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Total de usuários
              </Typography>
              <Typography variant="h5">{metrics.totalUsers}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Usuários premium
              </Typography>
              <Typography variant="h5">{metrics.premiumUsers}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Administradores
              </Typography>
              <Typography variant="h5">{metrics.adminUsers}</Typography>
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppCard>
              <Typography variant="body2" color="text.secondary">
                Bloqueados
              </Typography>
              <Typography variant="h5">{metrics.blockedUsers}</Typography>
            </AppCard>
          </Grid>
        </Grid>

        <AppCard>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                fullWidth
                label="Buscar por nome, e-mail ou telefone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ maxWidth: 420, width: "100%" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Filtro"
                value={filter}
                onChange={(e) =>
                  void handleChangeFilter(e.target.value as UserListFilter)
                }
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="admins">Admins</MenuItem>
                <MenuItem value="blocked">Bloqueados</MenuItem>
              </TextField>

              <Button
                variant="contained"
                onClick={() => void handleSearch()}
                disabled={loading}
              >
                Buscar
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="body2" color="text.secondary">
                {totalUsers} registro{totalUsers === 1 ? "" : "s"} encontrado
                {totalUsers === 1 ? "" : "s"}.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Página {page} de {totalPages}
              </Typography>
            </Stack>

            {loading ? (
              <Typography color="text.secondary">Carregando usuários...</Typography>
            ) : (
              <>
                <TableContainer>
                  <Table>
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
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={getPremiumLabel(user)}
                                color={user.premium ? "success" : "default"}
                              />
                              <Chip
                                size="small"
                                label={getBlockedLabel(user.is_blocked)}
                                color={user.is_blocked ? "error" : "default"}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {user.is_admin ? (
                              <Chip size="small" label="Administrador" color="primary" />
                            ) : (
                              <Chip size="small" label="Usuário" />
                            )}
                          </TableCell>
                          <TableCell>{user.is_admin ? "Sim" : "Não"}</TableCell>
                          <TableCell>{formatAdminDate(user.created_at)}</TableCell>
                          <TableCell>{formatAdminDate(user.last_sign_in_at)}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => openEditDialog(user)}>
                              <EditRoundedIcon />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() => handleDeleteRequest(user)}
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
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

                {totalPages > 1 ? (
                  <Stack alignItems="center" pt={1}>
                    <Pagination
                      page={page}
                      count={totalPages}
                      onChange={(_, value) => void handleChangePage(value)}
                      color="primary"
                    />
                  </Stack>
                ) : null}
              </>
            )}
          </Stack>
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
          <DialogActions>
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
              onClick={() => void handleSubmit(onSubmit)()}
              disabled={saving}
            >
              Salvar
            </Button>
          </DialogActions>
        }
      >
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nome"
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
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message || "Preencha apenas se quiser alterar"}
          />

          <TextField
            select
            fullWidth
            label="Premium"
            {...register("premiumMode")}
            error={!!errors.premiumMode}
            helperText={errors.premiumMode?.message}
          >
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="days">Premium por dias</MenuItem>
            <MenuItem value="until_date">Premium até data</MenuItem>
          </TextField>

          {premiumMode === "days" ? (
            <TextField
              label="Quantidade de dias"
              type="number"
              fullWidth
              {...register("premiumDays")}
              error={!!errors.premiumDays}
              helperText={errors.premiumDays?.message}
            />
          ) : null}

          {premiumMode === "until_date" ? (
            <TextField
              label="Premium até"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("premiumUntil")}
              error={!!errors.premiumUntil}
              helperText={errors.premiumUntil?.message}
            />
          ) : null}

          <Controller
            name="isAdmin"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label="Permissão administrativa"
                value={field.value ? "yes" : "no"}
                onChange={(e) => field.onChange(e.target.value === "yes")}
              >
                <MenuItem value="no">Não</MenuItem>
                <MenuItem value="yes">Sim</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="isBlocked"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label="Status da conta"
                value={field.value ? "blocked" : "active"}
                onChange={(e) => field.onChange(e.target.value === "blocked")}
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="blocked">Bloqueado</MenuItem>
              </TextField>
            )}
          />
        </Stack>
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="Excluir usuário"
        description="Essa ação remove o usuário, perfil, ganhos, gastos e contatos. Digite o e-mail exato do usuário para confirmar."
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setUserToDelete(null);
          setDeleteConfirmText("");
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      >
        <TextField
          fullWidth
          label="Confirme com o e-mail do usuário"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
        />
      </ConfirmDialog>
    </PageContainer>
  );
}