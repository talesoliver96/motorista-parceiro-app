import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
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
  type ExpenseFormInput,
} from "../expenses.schemas";
import { isFuelExpenseCategory } from "../expenses.utils";

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

function toCurrencyFieldValue(value: unknown): string | number | null | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined
  ) {
    return value;
  }

  return undefined;
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
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: "",
      category: "",
      amount: 0,
      compensate_automatic_fuel: false,
      notes: "",
    },
  });

  const category = watch("category");
  const isFuelCategory = isFuelExpenseCategory(category);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        date: initialData.date,
        category: initialData.category,
        amount: initialData.amount,
        compensate_automatic_fuel: Boolean(initialData.compensate_automatic_fuel),
        notes: initialData.notes ?? "",
      });
      return;
    }

    reset({
      date: new Date().toISOString().slice(0, 10),
      category: "",
      amount: 0,
      compensate_automatic_fuel: false,
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
            variant="contained"
            onClick={() => void handleSubmit(onSubmit)()}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} mt={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Data"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Categoria"
              fullWidth
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
            >
              {expenseCategories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  label="Valor do gasto"
                  value={toCurrencyFieldValue(field.value)}
                  onValueChange={(values) => {
                    field.onChange(parseCurrencyToNumber(values.formattedValue));
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
          </Grid>

          {isFuelCategory ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="compensate_automatic_fuel"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Tratamento do combustível automático"
                      value={field.value ? "compensate" : "sum"}
                      onChange={(event) =>
                        field.onChange(event.target.value === "compensate")
                      }
                    >
                      <MenuItem value="sum">Somar normalmente ao total</MenuItem>
                      <MenuItem value="compensate">
                        Compensar combustível automático
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Ao compensar, o sistema abate primeiro o combustível automático
                  estimado. Apenas o excedente permanece como gasto manual
                  considerado no total.
                </Alert>
              </Grid>
            </>
          ) : null}

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Observações"
              fullWidth
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