import { CssBaseline, ThemeProvider } from "@mui/material";
import { createContext, useContext, useMemo, useState } from "react";
import { buildTheme } from "../theme/theme";
import type { ThemeMode } from "../../types/app";

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

// Contexto para permitir troca de tema em qualquer parte do app.
const AppThemeContext = createContext<ThemeContextType | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("app-theme-mode");
    return saved === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("app-theme-mode", next);
      return next;
    });
  };

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme deve ser usado dentro de AppThemeProvider");
  }

  return context;
}