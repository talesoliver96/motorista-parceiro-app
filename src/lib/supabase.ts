import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Cliente único do Supabase.
// Reutilizado no app inteiro.
// Evita duplicação e facilita manutenção.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);