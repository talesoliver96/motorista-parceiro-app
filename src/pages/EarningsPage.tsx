import { useEffect, useMemo, useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";
import { useAuth } from "../app/providers/AuthProvider";
import type { Earning } from "../types/database";
import { earningsService } from "../features/earnings/earnings.service";
import { EarningsToolbar } from "../features/earnings/components/EarningsToolbar";
import { EarningsTable } from "../features/earnings/components/EarningsTable";
import { EarningsFormDialog } from "../features/earnings/components/EarningsFormDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import type { EarningFormValues } from "../features/earnings/earnings.schemas";
import {
  formatCurrency,
  getCurrentMonthRange,
} from "../features/earnings/earnings.utils";
import { AppCard } from "../components/common/AppCard";
import { useSnackbar } from "notistack";

export function EarningsPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [items, setItems] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Earning | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Earning | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await earningsService.listByPeriod(
        user.id,
        startDate,
        endDate
      );
      setItems(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar ganhos", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, startDate, endDate]);

  const totalGross = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.gross_amount || 0), 0),
    [items]
  );

  const totalKm = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.km_traveled || 0), 0),
    [items]
  );

  const handleCreate = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Earning) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDeleteRequest = (item: Earning) => {
    setItemToDelete(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async (values: EarningFormValues) => {
    if (!user) return;

    try {
      setSaving(true);

      if (selectedItem) {
        await earningsService.update(selectedItem.id, user.id, values);
        enqueueSnackbar("Ganho atualizado com sucesso", {
          variant: "success",
        });
      } else {
        await earningsService.create(user.id, values);
        enqueueSnackbar("Ganho cadastrado com sucesso", {
          variant: "success",
        });
      }

      setFormOpen(false);
      setSelectedItem(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao salvar ganho", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;

    try {
      setSaving(true);
      await earningsService.remove(itemToDelete.id, user.id);

      enqueueSnackbar("Ganho excluído com sucesso", {
        variant: "success",
      });

      setDeleteOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao excluir ganho", {
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
          <Typography variant="h4">Ganhos</Typography>
          <Typography color="text.secondary">
            Cadastre e acompanhe seus ganhos do período.
          </Typography>
        </Stack>

        {profile?.premium ? (
          <Alert severity="success">
            Sua conta está com recursos premium liberados.
          </Alert>
        ) : (
          <Alert severity="info">
            Alguns cálculos avançados serão liberados apenas no plano premium.
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ganho bruto do período
            </Typography>
            <Typography variant="h5">{formatCurrency(totalGross)}</Typography>
          </AppCard>

          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              KM total do período
            </Typography>
            <Typography variant="h5">
              {totalKm > 0 ? totalKm.toFixed(2) : "-"}
            </Typography>
          </AppCard>
        </Stack>

        <EarningsToolbar
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
          onClickAdd={handleCreate}
        />

        {loading ? (
          <AppCard>
            <Typography>Carregando ganhos...</Typography>
          </AppCard>
        ) : (
          <EarningsTable
            items={items}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </Stack>

      <EarningsFormDialog
        open={formOpen}
        loading={saving}
        initialData={selectedItem}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteOpen}
        loading={saving}
        title="Excluir ganho"
        description="Tem certeza que deseja excluir este ganho? Esta ação não pode ser desfeita."
        onClose={() => {
          if (saving) return;
          setDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}