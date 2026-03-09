// Utilitário para recuperar sessão travada do Supabase no navegador.
// Isso evita que o usuário precise abrir janela anônima quando houver
// conflito de lock/sessão antiga após deploys, mudanças de URL ou env.

function isBrowser() {
  return typeof window !== "undefined";
}

export function isSupabaseLockError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("lock broken by another request") ||
    message.includes("not released within 5000ms") ||
    message.includes("aborterror")
  );
}

export function clearSupabaseBrowserStorage() {
  if (!isBrowser()) return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    if (key.includes("supabase") || key.startsWith("sb-")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));

  const sessionKeysToRemove: string[] = [];

  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key) continue;

    if (key.includes("supabase") || key.startsWith("sb-")) {
      sessionKeysToRemove.push(key);
    }
  }

  sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
}