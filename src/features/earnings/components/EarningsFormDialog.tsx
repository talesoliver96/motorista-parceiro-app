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
import type { Earning } from "../../../types/database";
import {
  earningSchema,
  type EarningFormData,
} from "../earnings.schemas";

type Props = {
  open: boolean;
  loading?: boolean;
  initialData?: Earning | null;
  onClose: () => void;
  onSubmit: (values: EarningFormData) => Promise<void>;
};

function toInputValue(value: number | null | undefined) {
  return value ?? "";
}

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

export function EarningsFormDialog({
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
    watch,
    formState: { errors },
  } = useForm<EarningFormData>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      date: "",
      vehicle_type: "car",
      gross_amount: 0,
      km_traveled: undefined,
      fuel_efficiency: undefined,
      fuel_price: undefined,
      platform: "",
      work_hours: undefined,
      trips_count: undefined,
      notes: "",
    },
  });

  const vehicleType = watch("vehicle_type");

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        date: initialData.date,
        vehicle_type: initialData.vehicle_type,
        gross_amount: initialData.gross_amount,
        km_traveled: toInputValue(initialData.km_traveled) as never,
        fuel_efficiency: toInputValue(initialData.fuel_efficiency) as never,
        fuel_price: toInputValue(initialData.fuel_price) as never,
        platform: initialData.platform ?? "",
        work_hours: toInputValue(initialData.work_hours) as never,
        trips_count: toInputValue(initialData.trips_count) as never,
        notes: initialData.notes ?? "",
      });
      return;
    }

    reset({
      date: new Date().toISOString().slice(0, 10),
      vehicle_type: "car",
      gross_amount: 0,
      km_traveled: undefined,
      fuel_efficiency: undefined,
      fuel_price: undefined,
      platform: "",
      work_hours: undefined,
      trips_count: undefined,
      notes: "",
    });
  }, [open, initialData, reset]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar ganho" : "Novo ganho"}
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
              label="Tipo de veículo"
              select
              {...register("vehicle_type")}
              error={!!errors.vehicle_type}
              helperText={errors.vehicle_type?.message}
            >
              <MenuItem value="car">Carro</MenuItem>
              <MenuItem value="motorcycle">Moto</MenuItem>
              <MenuItem value="bicycle">Bicicleta</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="gross_amount"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  label="Ganho bruto"
                  value={field.value ? String(field.value).replace(".", ",") : ""}
                  onValueChange={(values) => {
                    field.onChange(parseCurrencyToNumber(values.formattedValue));
                  }}
                  error={!!errors.gross_amount}
                  helperText={errors.gross_amount?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Plataforma"
              placeholder="Uber, 99, iFood..."
              {...register("platform")}
              error={!!errors.platform}
              helperText={errors.platform?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="KM percorrido (opcional)"
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              {...register("km_traveled")}
              error={!!errors.km_traveled}
              helperText={errors.km_traveled?.message?.toString()}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Horas trabalhadas (opcional)"
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              {...register("work_hours")}
              error={!!errors.work_hours}
              helperText={errors.work_hours?.message?.toString()}
            />
          </Grid>

          {vehicleType !== "bicycle" ? (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Consumo por litro (opcional)"
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  {...register("fuel_efficiency")}
                  error={!!errors.fuel_efficiency}
                  helperText={errors.fuel_efficiency?.message?.toString()}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="fuel_price"
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      label="Preço do combustível (opcional)"
                      value={field.value ? String(field.value).replace(".", ",") : ""}
                      onValueChange={(values) => {
                        const parsed = values.formattedValue
                          ? parseCurrencyToNumber(values.formattedValue)
                          : undefined;
                        field.onChange(parsed);
                      }}
                      error={!!errors.fuel_price}
                      helperText={errors.fuel_price?.message?.toString()}
                    />
                  )}
                />
              </Grid>
            </>
          ) : null}

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Qtd. de corridas/entregas (opcional)"
              type="number"
              inputProps={{ step: "1", min: 0 }}
              {...register("trips_count")}
              error={!!errors.trips_count}
              helperText={errors.trips_count?.message?.toString()}
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