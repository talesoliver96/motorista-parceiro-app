import { Skeleton, Stack } from "@mui/material";

// Skeleton padrão para estados de carregamento.
// Mantém a interface elegante enquanto os dados são buscados.
export function AppSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={88} />
      <Skeleton variant="rounded" height={88} />
      <Skeleton variant="rounded" height={260} />
    </Stack>
  );
}