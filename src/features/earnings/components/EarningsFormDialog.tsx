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
import type { AppMode, Earning } from "../../../types/database";
import {
  earningSchema,
  type EarningFormInput,
  type EarningFormValues,
} from "../earnings.schemas";

type Props = {
  open: boolean;
  loading?: boolean;
  initialData?: Earning | null;
  appMode: AppMode;
  onClose: () => void;
  onSubmit: (values: EarningFormValues) => Promise<void>;
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

export function EarningsFormDialog({
  open,
  loading = false,
  initialData,
  appMode,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = !!initialData;
  const isDriverMode = appMode === "driver";

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EarningFormInput, unknown, EarningFormValues>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      date: "",
      vehicle_type: "car",
      gross_amount: 0,
      km_traveled: undefined,
      fuel_efficiency: undefined,
      fuel_price: undefined,
      auto_fuel_enabled: false,
      platform: "",
      work_hours: undefined,
      trips_count: undefined,
      notes: "",
    },
  });

  const vehicleType = watch("vehicle_type");
  const autoFuelEnabled = watch("auto_fuel_enabled");

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        date: initialData.date,
        vehicle_type: initialData.vehicle_type,
        gross_amount: initialData.gross_amount,
        km_traveled: toInputValue(initialData.km_traveled),
        fuel_efficiency: toInputValue(initialData.fuel_efficiency),
        fuel_price: toInputValue(initialData.fuel_price),
        auto_fuel_enabled: Boolean(initialData.auto_fuel_enabled),
        platform: initialData.platform ?? "",
        work_hours: toInputValue(initialData.work_hours),
        trips_count: toInputValue(initialData.trips_count),
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
      auto_fuel_enabled: false,
      platform: "",
      work_hours: undefined,
      trips_count: undefined,
      notes: "",
    });
  }, [open, initialData, reset]);

  useEffect(() => {
    if (!isDriverMode) {
      setValue("vehicle_type", "car");
      setValue("km_traveled", undefined);
      setValue("fuel_efficiency", undefined);
      setValue("fuel_price", undefined);
      setValue("auto_fuel_enabled", false);
      setValue("platform", "");
      setValue("work_hours", undefined);
      setValue("trips_count", undefined);
    }
  }, [isDriverMode, setValue]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={
        isEditing
          ? isDriverMode
            ? "Editar ganho"
            : "Editar entrada"
          : isDriverMode
          ? "Novo ganho"
          : "Nova entrada"
      }
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
        {!isDriverMode ? (
          <Alert severity="info">
            No modo controle financeiro essencial, esta tela registra entradas
            financeiras sem os campos operacionais de motorista.
          </Alert>
        ) : null}

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

          {isDriverMode ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Veículo"
                fullWidth
                {...register("vehicle_type")}
                error={!!errors.vehicle_type}
                helperText={errors.vehicle_type?.message}
              >
                <MenuItem value="car">Carro</MenuItem>
                <MenuItem value="motorcycle">Moto</MenuItem>
                <MenuItem value="bicycle">Bicicleta</MenuItem>
              </TextField>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, md: isDriverMode ? 6 : 12 }}>
            <Controller
              name="gross_amount"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  label={isDriverMode ? "Ganho bruto" : "Valor da entrada"}
                  value={toCurrencyFieldValue(field.value)}
                  onValueChange={(values) => {
                    field.onChange(parseCurrencyToNumber(values.formattedValue));
                  }}
                  error={!!errors.gross_amount}
                  helperText={errors.gross_amount?.message}
                />
              )}
            />
          </Grid>

          {isDriverMode ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Plataforma"
                fullWidth
                {...register("platform")}
                error={!!errors.platform}
                helperText={errors.platform?.message}
              />
            </Grid>
          ) : null}

          {isDriverMode ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="KM rodados"
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01" }}
                  {...register("km_traveled")}
                  error={!!errors.km_traveled}
                  helperText={errors.km_traveled?.message?.toString()}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Horas trabalhadas"
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01" }}
                  {...register("work_hours")}
                  error={!!errors.work_hours}
                  helperText={errors.work_hours?.message?.toString()}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Quantidade de corridas"
                  type="number"
                  fullWidth
                  {...register("trips_count")}
                  error={!!errors.trips_count}
                  helperText={errors.trips_count?.message?.toString()}
                />
              </Grid>
            </>
          ) : null}

          {isDriverMode && vehicleType !== "bicycle" ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Consumo do veículo (km/l)"
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01" }}
                  {...register("fuel_efficiency")}
                  error={!!errors.fuel_efficiency}
                  helperText={errors.fuel_efficiency?.message?.toString()}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="fuel_price"
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      label="Preço do combustível"
                      value={toCurrencyFieldValue(field.value)}
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

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="auto_fuel_enabled"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Cálculo automático de combustível"
                      value={field.value ? "enabled" : "disabled"}
                      onChange={(event) =>
                        field.onChange(event.target.value === "enabled")
                      }
                    >
                      <MenuItem value="disabled">Não utilizar neste ganho</MenuItem>
                      <MenuItem value="enabled">Utilizar cálculo automático neste ganho</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Alert severity={autoFuelEnabled ? "success" : "info"}>
                  {autoFuelEnabled
                    ? "Este ganho participará do cálculo automático de combustível quando KM, consumo e preço estiverem preenchidos."
                    : "Este ganho não será usado no cálculo automático de combustível."}
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