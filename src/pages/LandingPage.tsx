import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  Link,
  Divider,
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import PedalBikeRoundedIcon from "@mui/icons-material/PedalBikeRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { formatCurrency } from "../features/earnings/earnings.utils";

function SectionCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        p: 3.5,
        borderRadius: 5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ color: "primary.main" }}>{props.icon}</Box>
        <Typography variant="h6" fontWeight={700}>
          {props.title}
        </Typography>
        <Typography color="text.secondary">{props.description}</Typography>
      </Stack>
    </Box>
  );
}

export function LandingPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(128,128,128,0.12)",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ minHeight: 72, px: "0 !important" }}>
            <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
              MotoristaParceiro
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Link component={RouterLink} to="/contact-public" underline="hover">
                Contato
              </Link>

              <Link component={RouterLink} to="/terms" underline="hover">
                Regras
              </Link>

              {user ? (
                <Button component={RouterLink} to="/dashboard" variant="contained">
                  Ir para o Dashboard
                </Button>
              ) : (
                <>
                  <Link component={RouterLink} to="/login" underline="hover">
                    Entrar
                  </Link>

                  <Button component={RouterLink} to="/cadastro" variant="contained">
                    Criar conta
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              <Chip
                icon={<InsightsRoundedIcon />}
                label="Controle simples para quem vive da rua trabalhando"
                color="primary"
                variant="outlined"
                sx={{ width: "fit-content", px: 1 }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.7rem", md: "4rem" },
                  lineHeight: 1.05,
                  fontWeight: 900,
                }}
              >
                Organize seus ganhos, gastos e resultado real em um só lugar.
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1.05rem", md: "1.2rem" },
                  color: "text.secondary",
                  maxWidth: 640,
                }}
              >
                Feito para motorista de app, entregador de moto e ciclista.
                Acompanhe quanto entra, quanto sai e quanto realmente sobra,
                sem planilhas complicadas e sem depender de anotações soltas.
              </Typography>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  component={RouterLink}
                  to={user ? "/dashboard" : "/cadastro"}
                  variant="contained"
                  size="large"
                >
                  {user ? "Abrir meu painel" : "Começar agora"}
                </Button>

                {!user ? (
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                  >
                    Já tenho conta
                  </Button>
                ) : null}
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<DirectionsCarRoundedIcon />} label="Carro" />
                <Chip icon={<TwoWheelerRoundedIcon />} label="Moto" />
                <Chip icon={<PedalBikeRoundedIcon />} label="Bike" />
                <Chip label="Gratuito para começar" color="success" variant="outlined" />
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 6,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    Resumo do mês
                  </Typography>
                  <Chip label="Premium liberado" color="success" />
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Ganho bruto
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {formatCurrency(4580)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Lucro líquido
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {formatCurrency(3210)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ganhos por dia
                      </Typography>

                      <Stack direction="row" alignItems="flex-end" spacing={1}>
                        {[40, 78, 58, 92, 65, 88, 50].map((height, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height,
                              borderRadius: 4,
                              bgcolor: "primary.main",
                              opacity: 0.8 + (index % 2) * 0.1,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<SavingsRoundedIcon />}
              title="Saiba quanto realmente sobra"
              description="Veja seu valor bruto, seus gastos e o lucro líquido em um painel simples, sem precisar montar conta na mão."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<QueryStatsRoundedIcon />}
              title="Acompanhe sua evolução"
              description="Compare períodos, descubra seus dias mais fortes e entenda se você está melhorando mês a mês."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<ReceiptLongRoundedIcon />}
              title="Controle gastos do dia a dia"
              description="Anote comida, contas, parcela, locação e outros custos para saber o resultado real do seu trabalho."
            />
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={800}>
                Gratuito para começar e fácil de entender.
              </Typography>
              <Typography color="text.secondary">
                Você pode usar gratuitamente para organizar sua rotina de trabalho,
                acompanhar ganhos e gastos e entender melhor sua operação.
              </Typography>
              <Typography color="text.secondary">
                O objetivo do app é simples: ajudar você a parar de trabalhar no escuro
                e começar a enxergar números reais.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <SectionCard
                icon={<SecurityRoundedIcon />}
                title="Seus dados com mais controle"
                description="Cada usuário tem conta própria, painel individual e permissões controladas para manter o sistema organizado."
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 6,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={800}>
                  Tenha clareza do seu trabalho todos os dias.
                </Typography>
                <Typography sx={{ opacity: 0.92 }}>
                  Organize ganhos, controle gastos e acompanhe seu lucro real em poucos minutos.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction={{ xs: "column", sm: "row", md: "column" }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to={user ? "/dashboard" : "/cadastro"}
                  variant="contained"
                  color="inherit"
                  sx={{ color: "primary.main" }}
                >
                  {user ? "Abrir painel" : "Criar conta grátis"}
                </Button>

                {!user ? (
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(255,255,255,0.6)",
                      color: "white",
                    }}
                  >
                    Entrar
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: 2 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Divider />

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography color="text.secondary">
                © {new Date().getFullYear()} MotoristaParceiro. Controle simples para quem trabalha com app.
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Link component={RouterLink} to="/contact-public" underline="hover">
                  Contato
                </Link>
                <Link component={RouterLink} to="/terms" underline="hover">
                  Contrato e regras
                </Link>
                <Link component={RouterLink} to="/login" underline="hover">
                  Entrar
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}