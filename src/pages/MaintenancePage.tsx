import { Box, Container, Stack, Typography } from "@mui/material";

type Props = {
  message?: string;
};

export function MaintenancePage({ message }: Props) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Stack spacing={2} textAlign="center">
          <Typography variant="h3" fontWeight={800}>
            Sistema em manutenção
          </Typography>
          <Typography color="text.secondary">
            {message || "Estamos em manutenção no momento. Tente novamente em instantes."}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}