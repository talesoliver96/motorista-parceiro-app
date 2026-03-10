import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Digite seu nome completo")
    .max(120, "Nome muito longo"),
  phone: z
    .string()
    .min(8, "Digite um telefone válido")
    .max(20, "Telefone muito longo"),
  email: z.email("Digite um e-mail válido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "Senha muito longa"),
  appMode: z.enum(["driver", "basic"], {
    error: "Selecione a experiência desejada",
  }),
});

export const loginSchema = z.object({
  email: z.email("Digite um e-mail válido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "Senha muito longa"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;