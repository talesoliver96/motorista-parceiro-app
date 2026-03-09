import { Box, Typography } from "@mui/material";

type Props = {
  title: string;
  description?: string;
};

// Estado vazio padrão.
// Mantém consistência visual nas tabelas/listas sem dados.
export function EmptyState({ title, description }: Props) {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: "center",
      }}
    >
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}