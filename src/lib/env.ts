// Centraliza leitura de variáveis de ambiente.
// Assim, se no futuro você mudar nomes ou quiser validar melhor,
// faz tudo em um só lugar.
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
};

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    "Variáveis do Supabase não configuradas. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env"
  );
}