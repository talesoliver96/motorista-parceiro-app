import { useEffect, useMemo, useState } from "react";
import { Alert, Pagination, Stack, Typography } from "@mui/material";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { AdvancedMovementFilters } from "../components/common/AdvancedMovementFilters";
import { useAuth } from "../app/providers/AuthProvider";
import type { Expense, Earning } from "../types/database";
import { expensesService } from "../features/expenses/expenses.service";
import { earningsService } from "../features/earnings/earnings.service";
import { ExpensesToolbar } from "../features/expenses/components/ExpensesToolbar";
import { ExpensesTable } from "../features/expenses/components/ExpensesTable";
import { ExpensesFormDialog } from "../features/expenses/components/ExpensesFormDialog";
import type { ExpenseFormData } from "../features/expenses/expenses.schemas";
import {
  formatCurrency,
  getCurrentMonthRange,
} from "../features/earnings/earnings.utils";
import { useSnackbar } from "notistack";
import type { ExpenseListItem } from "../features/expenses/expenses.types";
import { buildReconciledExpenseData } from "../features/expenses/expenses.utils";
import { isPremiumProfile } from "../features/premium/premium.utils";
import {
  getSmartListPageSize,
  getTotalPages,
  paginateArray,
} from "../utils/pagination";
import {
  buildUniqueOptions,
  emptyAdvancedMovementFilters,
  filterExpenseItems,
  type AdvancedMovementFilters as AdvancedMovementFiltersState,
} from "../utils/movementFilters";

export function ExpensesPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isPremium = isPremiumProfile(profile);
  const appMode = profile?.app_mode ?? "driver";
  const isDriverMode = appMode === "driver";

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [manualItems, setManualItems] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<AdvancedMovementFiltersState>(
    emptyAdvancedMovementFilters
  );

  const [page, setPage] = useState(1);

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
    setPage(1);
    void loadData();
  }, [user, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const reconciled = useMemo(
    () => buildReconciledExpenseData(manualItems, earnings, isPremium && isDriverMode),
    [manualItems, earnings, isPremium, isDriverMode]
  );

  const categoryOptions = useMemo(
    () => buildUniqueOptions(reconciled.items.map((item) => item.category)),
    [reconciled.items]
  );

  const filteredItems = useMemo(
    () => filterExpenseItems(reconciled.items, filters),
    [reconciled.items, filters]
  );

  const manualTotal = useMemo(
    () =>
      filteredItems
        .filter((item) => item.source === "manual")
        .reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [filteredItems]
  );

  const automaticFuelTotal = useMemo(
    () =>
      filteredItems
        .filter((item) => item.source === "automatic_fuel")
        .reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [filteredItems]
  );

  const compensatedFuelTotal = useMemo(
    () =>
      filteredItems
        .filter((item) => item.source === "manual")
        .reduce(
          (acc, item) => acc + Number(item.compensated_automatic_fuel_amount || 0),
          0
        ),
    [filteredItems]
  );

  const totalExpenses = useMemo(
    () => manualTotal + automaticFuelTotal,
    [manualTotal, automaticFuelTotal]
  );

  const pageSize = useMemo(
    () => getSmartListPageSize(startDate, endDate),
    [startDate, endDate]
  );

  const totalPages = useMemo(
    () => getTotalPages(filteredItems.length, pageSize),
    [filteredItems.length, pageSize]
  );

  const paginatedItems = useMemo(
    () => paginateArray(filteredItems, page, pageSize),
    [filteredItems, page, pageSize]
  );

  const handleCreate = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: ExpenseListItem) => {
    if (item.source !== "manual") return;

    const manual = manualItems.find((entry) => entry.id === item.id);
    if (!manual) return;

    setSelectedItem(manual);
    setFormOpen(true);
  };

  const handleDeleteRequest = (item: ExpenseListItem) => {
    if (item.source !== "manual") return;

    const manual = manualItems.find((entry) => entry.id === item.id);
    if (!manual) return;

    setItemToDelete(manual);
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
            {isDriverMode
              ? "Cadastre seus custos e use filtros avançados para encontrar qualquer movimentação."
              : "Cadastre suas saídas e use filtros avançados para analisar seu fluxo financeiro."}
          </Typography>
        </Stack>

        {isDriverMode ? (
          isPremium ? (
            <Alert severity="success">
              Sua conta premium permite cálculo automático e compensação inteligente de combustível.
            </Alert>
          ) : (
            <Alert severity="info">
              O cálculo automático e a compensação inteligente de combustível são recursos premium.
            </Alert>
          )
        ) : (
          <Alert severity="info">
            No modo essencial, os gastos são tratados como saídas financeiras com filtro avançado por texto, categoria e período.
          </Alert>
        )}

        <AppCard>
          <Stack spacing={2}>
            <ExpensesToolbar
              startDate={startDate}
              endDate={endDate}
              onChangeStartDate={setStartDate}
              onChangeEndDate={setEndDate}
              onClickAdd={handleCreate}
            />

            <AdvancedMovementFilters
              title="Filtro avançado de gastos"
              categoryLabel="Categoria"
              categoryOptions={categoryOptions}
              value={filters}
              onChange={setFilters}
            />
          </Stack>
        </AppCard>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Gastos manuais considerados
            </Typography>
            <Typography variant="h5">{formatCurrency(manualTotal)}</Typography>
          </AppCard>

          {isDriverMode ? (
            <>
              <AppCard sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Combustível automático restante
                </Typography>
                <Typography variant="h5">
                  {isPremium ? formatCurrency(automaticFuelTotal) : "Premium"}
                </Typography>
              </AppCard>

              <AppCard sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Compensação automática aplicada
                </Typography>
                <Typography variant="h5">
                  {isPremium ? formatCurrency(compensatedFuelTotal) : "Premium"}
                </Typography>
              </AppCard>
            </>
          ) : null}

          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total de gastos
            </Typography>
            <Typography variant="h5">{formatCurrency(totalExpenses)}</Typography>
          </AppCard>
        </Stack>

        {loading ? (
          <Typography color="text.secondary">Carregando gastos...</Typography>
        ) : (
          <>
            <ExpensesTable
              items={paginatedItems}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />

            {totalPages > 1 ? (
              <Pagination
                page={page}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            ) : null}
          </>
        )}

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
          description="Esta ação removerá o gasto selecionado. Deseja continuar?"
          onClose={() => {
            if (saving) return;
            setDeleteOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      </Stack>
    </PageContainer>
  );
}