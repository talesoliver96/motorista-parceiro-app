import { useEffect, useMemo, useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";
import { useAuth } from "../app/providers/AuthProvider";
import type { Expense, Earning } from "../types/database";
import { expensesService } from "../features/expenses/expenses.service";
import { earningsService } from "../features/earnings/earnings.service";
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
import type { ExpenseListItem } from "../features/expenses/expenses.types";
import { buildAutomaticFuelExpenses } from "../features/expenses/expenses.utils";
import { isPremiumProfile } from "../features/premium/premium.utils";

export function ExpensesPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const isPremium = isPremiumProfile(profile);

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [manualItems, setManualItems] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
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

      const [expensesData, earningsData] = await Promise.all([
        expensesService.listByPeriod(user.id, startDate, endDate),
        earningsService.listByPeriod(user.id, startDate, endDate),
      ]);

      setManualItems(expensesData);
      setEarnings(earningsData);
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

  const automaticFuelItems = useMemo(
    () => (isPremium ? buildAutomaticFuelExpenses(earnings) : []),
    [earnings, isPremium]
  );

  const items = useMemo<ExpenseListItem[]>(() => {
    const manual: ExpenseListItem[] = manualItems.map((item) => ({
      ...item,
      source: "manual",
      isReadonly: false,
    }));

    return [...manual, ...automaticFuelItems].sort((a, b) => {
      if (a.date === b.date) {
        return b.created_at.localeCompare(a.created_at);
      }

      return b.date.localeCompare(a.date);
    });
  }, [manualItems, automaticFuelItems]);

  const manualTotal = useMemo(
    () => manualItems.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [manualItems]
  );

  const automaticFuelTotal = useMemo(
    () =>
      automaticFuelItems.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [automaticFuelItems]
  );

  const totalExpenses = manualTotal + automaticFuelTotal;

  const handleCreate = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: ExpenseListItem) => {
    if (item.source !== "manual") return;
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDeleteRequest = (item: ExpenseListItem) => {
    if (item.source !== "manual") return;
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
            Cadastre seus custos e acompanhe seu resultado real.
          </Typography>
        </Stack>

        {isPremium ? (
          <Alert severity="success">
            Sua conta premium soma automaticamente o gasto de combustível quando houver KM, consumo e preço preenchidos.
          </Alert>
        ) : (
          <Alert severity="info">
            O cálculo automático de combustível é um recurso premium.
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Gastos manuais
            </Typography>
            <Typography variant="h5">{formatCurrency(manualTotal)}</Typography>
          </AppCard>

          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Combustível automático
            </Typography>
            <Typography variant="h5">
              {isPremium ? formatCurrency(automaticFuelTotal) : "Premium"}
            </Typography>
          </AppCard>

          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total de gastos
            </Typography>
            <Typography variant="h5">{formatCurrency(totalExpenses)}</Typography>
          </AppCard>
        </Stack>

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
        description="Tem certeza que deseja excluir este gasto manual? Esta ação não pode ser desfeita."
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