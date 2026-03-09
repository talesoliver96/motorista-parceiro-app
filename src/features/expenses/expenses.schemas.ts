import { z } from "zod";

const optionalText = z.string().optional();

export const expenseSchema = z.object({
  date: z.string().min(1, "Selecione a data"),
  category: z.string().min(1, "Selecione uma categoria"),
  amount: z.preprocess(
    (value) => Number(value),
    z.number().positive("O gasto deve ser maior que zero")
  ),
  notes: optionalText,
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const expenseCategories = [
  "Combustível",
  "Alimentação",
  "Manutenção",
  "Pedágio",
  "Lavagem",
  "Parcela/Locação",
  "Internet/Telefone",
  "Outros",
];