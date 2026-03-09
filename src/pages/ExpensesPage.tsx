import { useEffect, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";
import { useAuth } from "../app/providers/AuthProvider";
import type { Expense } from "../types/database";
import { expensesService } from "../features/expenses/expenses.service";
import { ExpensesToolbar } from "../features/expenses/components/ExpensesToolbar";
import { ExpensesTable } from "../features/expenses/components/ExpensesTable";
import { ExpensesFormDialog } from "../features/expenses/components/ExpensesFormDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import type { ExpenseFormData } from "../features/expenses/expenses.schemas";
import {
  formatCurrency,
  getCurrentMonthRange,
} from "../features/earnings/earnings.utils";
import { AppCard } from "../components/common/AppCard";
import { useSnackbar } from "notistack";

export function ExpensesPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Expense | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Expense | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await expensesService.listByPeriod(user.id, startDate, endDate);
      setItems(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao carregar gastos", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, startDate, endDate]);

  const totalExpenses = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [items]
  );

  const handleCreate = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: Expense) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDeleteRequest = (item: Expense) => {
    setItemToDelete(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async (values: ExpenseFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      if (selectedItem) {
        await expensesService.update(selectedItem.id, user.id, values);
        enqueueSnackbar("Gasto atualizado com sucesso", {
          variant: "success",
        });
      } else {
        await expensesService.create(user.id, values);
        enqueueSnackbar("Gasto cadastrado com sucesso", {
          variant: "success",
        });
      }

      setFormOpen(false);
      setSelectedItem(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao salvar gasto", {
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
      await expensesService.remove(itemToDelete.id, user.id);

      enqueueSnackbar("Gasto excluído com sucesso", {
        variant: "success",
      });

      setDeleteOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao excluir gasto", {
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
          <Typography variant="h4">Gastos</Typography>
          <Typography color="text.secondary">
            Cadastre seus custos para acompanhar o lucro real.
          </Typography>
        </Stack>

        <AppCard>
          <Typography variant="body2" color="text.secondary">
            Total de gastos do período
          </Typography>
          <Typography variant="h5">{formatCurrency(totalExpenses)}</Typography>
        </AppCard>

        <ExpensesToolbar
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
          onClickAdd={handleCreate}
        />

        {loading ? (
          <AppCard>
            <Typography>Carregando gastos...</Typography>
          </AppCard>
        ) : (
          <ExpensesTable
            items={items}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </Stack>

      <ExpensesFormDialog
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
        title="Excluir gasto"
        description="Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita."
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