import { useEffect, useMemo, useState } from "react";
import { Alert, Pagination, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useAuth } from "../app/providers/AuthProvider";
import { isPremiumProfile } from "../features/premium/premium.utils";
import { earningsService } from "../features/earnings/earnings.service";
import { EarningsToolbar } from "../features/earnings/components/EarningsToolbar";
import { EarningsTable } from "../features/earnings/components/EarningsTable";
import { EarningsFormDialog } from "../features/earnings/components/EarningsFormDialog";
import type { Earning } from "../types/database";
import type { EarningFormValues } from "../features/earnings/earnings.schemas";
import {
  formatCurrency,
  getAutomaticFuelCost,
  getCurrentMonthRange,
} from "../features/earnings/earnings.utils";
import {
  getSmartListPageSize,
  getTotalPages,
  paginateArray,
} from "../utils/pagination";

export function EarningsPage() {
  const { user, profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isPremium = isPremiumProfile(profile);
  const appMode = profile?.app_mode ?? "driver";
  const isDriverMode = appMode === "driver";

  const initialRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const [items, setItems] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Earning | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Earning | null>(null);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await earningsService.listByPeriod(user.id, startDate, endDate);
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
    setPage(1);
    void loadData();
  }, [user, startDate, endDate]);

  const pageSize = useMemo(
    () => getSmartListPageSize(startDate, endDate),
    [startDate, endDate]
  );

  const totalPages = useMemo(
    () => getTotalPages(items.length, pageSize),
    [items.length, pageSize]
  );

  const paginatedItems = useMemo(
    () => paginateArray(items, page, pageSize),
    [items, page, pageSize]
  );

  const totalGross = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.gross_amount || 0), 0),
    [items]
  );

  const totalAutomaticFuel = useMemo(() => {
    if (!isPremium || !isDriverMode) return 0;

    return items.reduce((acc, item) => {
      const value = getAutomaticFuelCost(item);
      return acc + Number(value || 0);
    }, 0);
  }, [items, isPremium, isDriverMode]);

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
        enqueueSnackbar(
          isDriverMode
            ? "Ganho atualizado com sucesso"
            : "Entrada atualizada com sucesso",
          {
            variant: "success",
          }
        );
      } else {
        await earningsService.create(user.id, values);
        enqueueSnackbar(
          isDriverMode
            ? "Ganho cadastrado com sucesso"
            : "Entrada cadastrada com sucesso",
          {
            variant: "success",
          }
        );
      }

      setFormOpen(false);
      setSelectedItem(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        isDriverMode ? "Erro ao salvar ganho" : "Erro ao salvar entrada",
        {
          variant: "error",
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;

    try {
      setSaving(true);

      await earningsService.remove(itemToDelete.id, user.id);

      enqueueSnackbar(
        isDriverMode
          ? "Ganho excluído com sucesso"
          : "Entrada excluída com sucesso",
        {
          variant: "success",
        }
      );

      setDeleteOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        isDriverMode ? "Erro ao excluir ganho" : "Erro ao excluir entrada",
        {
          variant: "error",
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">
            {isDriverMode ? "Ganhos" : "Entradas"}
          </Typography>
          <Typography color="text.secondary">
            {isDriverMode
              ? "Registre seus ganhos e acompanhe sua operação com mais precisão."
              : "Registre suas entradas financeiras e acompanhe sua evolução com clareza."}
          </Typography>
        </Stack>

        {isDriverMode ? (
          isPremium ? (
            <Alert severity="success">
              Sua conta premium permite ativar o cálculo automático de combustível
              por ganho, usando KM, consumo e preço informado.
            </Alert>
          ) : (
            <Alert severity="info">
              O cálculo automático de combustível por ganho é um recurso premium.
            </Alert>
          )
        ) : (
          <Alert severity="info">
            No modo controle financeiro essencial, esta tela registra entradas sem
            dados operacionais de motorista.
          </Alert>
        )}

        <AppCard>
          <Stack spacing={2}>
            <EarningsToolbar
              startDate={startDate}
              endDate={endDate}
              onChangeStartDate={setStartDate}
              onChangeEndDate={setEndDate}
              onClickAdd={handleCreate}
            />
          </Stack>
        </AppCard>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <AppCard sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {isDriverMode ? "Ganho bruto no período" : "Entradas no período"}
            </Typography>
            <Typography variant="h5">{formatCurrency(totalGross)}</Typography>
          </AppCard>

          {isDriverMode ? (
            <AppCard sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Combustível automático estimado
              </Typography>
              <Typography variant="h5">
                {isPremium ? formatCurrency(totalAutomaticFuel) : "Premium"}
              </Typography>
            </AppCard>
          ) : null}
        </Stack>

        {loading ? (
          <Typography color="text.secondary">
            {isDriverMode ? "Carregando ganhos..." : "Carregando entradas..."}
          </Typography>
        ) : (
          <>
            <EarningsTable
              items={paginatedItems}
              isPremium={isPremium}
              appMode={appMode}
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

        <EarningsFormDialog
          open={formOpen}
          loading={saving}
          initialData={selectedItem}
          appMode={appMode}
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
          title={isDriverMode ? "Excluir ganho" : "Excluir entrada"}
          description={
            isDriverMode
              ? "Esta ação removerá o ganho selecionado. Deseja continuar?"
              : "Esta ação removerá a entrada selecionada. Deseja continuar?"
          }
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