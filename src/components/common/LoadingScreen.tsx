import { Box, CircularProgress } from "@mui/material";

// Tela padrão de carregamento.
// Usada quando o app ainda está validando sessão.
export function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}