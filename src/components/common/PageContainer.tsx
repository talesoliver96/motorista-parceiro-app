import { Box, Container } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

export function PageContainer({ children }: Props) {
  return (
    <Box sx={{ py: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}