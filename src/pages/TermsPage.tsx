import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={3}>
        <Button component={RouterLink} to="/" variant="text" sx={{ width: "fit-content" }}>
          Voltar
        </Button>

        <Typography variant="h3" fontWeight={800}>
          Contrato e regras de uso
        </Typography>

        <Typography color="text.secondary">
          Este aplicativo foi criado para ajudar motoristas e entregadores a organizarem
          seus ganhos, gastos e desempenho.
        </Typography>

        <Stack spacing={2}>
          <Typography variant="h6">1. Uso da plataforma</Typography>
          <Typography color="text.secondary">
            O usuário é responsável pelas informações que registra e pela conferência
            dos seus próprios dados.
          </Typography>

          <Typography variant="h6">2. Conta do usuário</Typography>
          <Typography color="text.secondary">
            Cada conta é pessoal. O usuário deve manter sua senha em segurança e
            não compartilhar o acesso.
          </Typography>

          <Typography variant="h6">3. Disponibilidade</Typography>
          <Typography color="text.secondary">
            O sistema pode receber melhorias, ajustes e manutenções para evolução do serviço.
          </Typography>

          <Typography variant="h6">4. Limitação</Typography>
          <Typography color="text.secondary">
            O aplicativo é uma ferramenta de apoio à gestão pessoal e não substitui
            orientação contábil, fiscal ou financeira profissional.
          </Typography>

          <Typography variant="h6">5. Planos e recursos</Typography>
          <Typography color="text.secondary">
            Alguns recursos podem ser gratuitos e outros podem se tornar premium no futuro.
            As condições podem ser atualizadas conforme a evolução do produto.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}