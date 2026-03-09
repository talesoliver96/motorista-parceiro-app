import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  },
  z.number().positive().optional()
);

export const earningSchema = z.object({
  date: z.string().min(1, "Selecione a data"),
  vehicle_type: z.enum(["car", "motorcycle", "bicycle"]),
  gross_amount: z.preprocess(
    (value) => Number(value),
    z.number().positive("O ganho deve ser maior que zero")
  ),
  km_traveled: optionalNumber,
  fuel_efficiency: optionalNumber,
  fuel_price: optionalNumber,
  platform: z.string().optional(),
  work_hours: optionalNumber,
  trips_count: optionalNumber,
  notes: z.string().optional(),
});

export type EarningFormData = z.infer<typeof earningSchema>;