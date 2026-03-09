function isBrowser() {
  return typeof window !== "undefined";
}

export function clearSupabaseBrowserStorage() {
  if (!isBrowser()) return;

  const localKeys: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    if (key.includes("supabase") || key.startsWith("sb-")) {
      localKeys.push(key);
    }
  }

  localKeys.forEach((key) => window.localStorage.removeItem(key));

  const sessionKeys: string[] = [];

  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key) continue;

    if (key.includes("supabase") || key.startsWith("sb-")) {
      sessionKeys.push(key);
    }
  }

  sessionKeys.forEach((key) => window.sessionStorage.removeItem(key));
}