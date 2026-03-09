import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppDialog } from "../../../components/common/AppDialog";
import { CurrencyField } from "../../../components/common/CurrencyField";
import type { Expense } from "../../../types/database";
import {
  expenseCategories,
  expenseSchema,
  type ExpenseFormData,
} from "../expenses.schemas";

type Props = {
  open: boolean;
  loading?: boolean;
  initialData?: Expense | null;
  onClose: () => void;
  onSubmit: (values: ExpenseFormData) => Promise<void>;
};

function parseCurrencyToNumber(value: string | undefined) {
  if (!value) return 0;

  return Number(
    value
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

export function ExpensesFormDialog({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      date: "",
      category: "",
      amount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        date: initialData.date,
        category: initialData.category,
        amount: initialData.amount,
        notes: initialData.notes ?? "",
      });
      return;
    }

    reset({
      date: new Date().toISOString().slice(0, 10),
      category: "",
      amount: 0,
      notes: "",
    });
  }, [open, initialData, reset]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar gasto" : "Novo gasto"}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : "Salvar"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Data"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Categoria"
              select
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
            >
              {expenseCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  label="Valor do gasto"
                  value={field.value ? String(field.value).replace(".", ",") : ""}
                  onValueChange={(values) => {
                    field.onChange(parseCurrencyToNumber(values.formattedValue));
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Observações"
              multiline
              minRows={3}
              {...register("notes")}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
          </Grid>
        </Grid>
      </Stack>
    </AppDialog>
  );
}