import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

export function PublicContactPage() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "Contato público",
    subject: "",
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          userId: null,
          name: form.name,
          email: form.email,
          category: form.category,
          subject: form.subject,
          message: form.message,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao enviar mensagem");
      }

      setSuccessMessage("Mensagem enviada com sucesso.");
      setForm({
        name: "",
        email: "",
        category: "Contato público",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível enviar a mensagem agora.");
    } finally {
      setLoading(false);
    }
  };

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

        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            p: 4,
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Nome"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />

            <TextField
              label="Assunto"
              fullWidth
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            />

            <TextField
              label="Mensagem"
              multiline
              minRows={5}
              fullWidth
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            />

            <Button type="submit" variant="contained" disabled={loading}>
              Enviar mensagem
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}