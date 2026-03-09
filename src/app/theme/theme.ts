import { createTheme } from "@mui/material/styles";

// Função responsável por criar o tema.
// Separar isso em arquivo próprio deixa o projeto organizado
// e facilita alterações futuras de identidade visual.
export function buildTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
      background:
        mode === "dark"
          ? {
              default: "#0b0f14",
              paper: "#111827",
            }
          : {
              default: "#f7f9fc",
              paper: "#ffffff",
            },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily:
        '"Roboto", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "dark"
                ? "0 6px 24px rgba(0,0,0,0.28)"
                : "0 6px 24px rgba(15,23,42,0.08)",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            minHeight: 42,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          size: "small",
        },
      },
    },
  });
}