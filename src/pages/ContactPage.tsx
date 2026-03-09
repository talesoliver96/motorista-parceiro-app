import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { PageContainer } from "../components/common/PageContainer";
import { AppCard } from "../components/common/AppCard";
import { useAuth } from "../app/providers/AuthProvider";
import { useSnackbar } from "notistack";
import { supabase } from "../lib/supabase";
import { useState } from "react";

const contactSchema = z.object({
  category: z.string().min(1, "Selecione uma categoria"),
  subject: z.string().min(3, "Digite um assunto"),
  message: z.string().min(10, "Descreva melhor sua sugestão ou problema"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const categories = [
  "Sugestão de melhoria",
  "Campo faltando",
  "Problema no app",
  "Dúvida",
  "Outro",
];

export function ContactPage() {
  const { profile, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [sending, setSending] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormData) => {
    try {
      setSending(true);

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          userId: user?.id,
          name: profile?.name || "",
          email: user?.email || "",
          category: values.category,
          subject: values.subject,
          message: values.message,
        },
      });

      if (error) throw error;

      enqueueSnackbar("Mensagem enviada com sucesso", {
        variant: "success",
      });

      reset({
        category: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Erro ao enviar mensagem", {
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Contato conosco</Typography>
          <Typography color="text.secondary">
            Envie sugestões, melhorias, campos faltando ou qualquer feedback
            sobre o app.
          </Typography>
        </Stack>

        <Alert severity="info">
          Seu feedback é importante para evoluir o produto.
        </Alert>

        <AppCard>
          <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nome"
                  value={profile?.name || ""}
                  disabled
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="E-mail"
                  value={user?.email || ""}
                  disabled
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Categoria"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Assunto"
                  {...register("subject")}
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Mensagem"
                  multiline
                  minRows={6}
                  {...register("message")}
                  error={!!errors.message}
                  helperText={errors.message?.message}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={sending}>
                Enviar mensagem
              </Button>
            </Stack>
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}