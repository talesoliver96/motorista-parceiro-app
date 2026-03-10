import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

export function PublicContactPage() {
  const [success, setSuccess] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={3}>
        <Button component={RouterLink} to="/" variant="text" sx={{ width: "fit-content" }}>
          Voltar
        </Button>

        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={800}>
            Fale com a gente
          </Typography>
          <Typography color="text.secondary">
            Envie sua dúvida, sugestão ou proposta comercial.
          </Typography>
        </Stack>

        {success ? (
          <Alert severity="success">
            Mensagem enviada com sucesso.
          </Alert>
        ) : null}

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setSuccess(true);
          }}
          sx={{
            p: 4,
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <TextField label="Nome" fullWidth />
            <TextField label="E-mail" type="email" fullWidth />
            <TextField label="Assunto" fullWidth />
            <TextField label="Mensagem" multiline minRows={5} fullWidth />

            <Button type="submit" variant="contained">
              Enviar mensagem
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}