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
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import PedalBikeRoundedIcon from "@mui/icons-material/PedalBikeRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { formatCurrency } from "../features/earnings/earnings.utils";

function SectionCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        p: 4,
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
  const { settings } = usePublicAppSettings();

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
                Contrato e regras
              </Link>

              {settings.subscriptionMode.enabled ? (
                <Link component={RouterLink} to="/subscription" underline="hover">
                  Assinatura
                </Link>
              ) : null}

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

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
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
                  fontSize: { xs: "2.8rem", md: "4.2rem" },
                  lineHeight: 1.03,
                  fontWeight: 900,
                }}
              >
                Organize seus ganhos, gastos e resultado real em um só lugar.
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1.05rem", md: "1.18rem" },
                  color: "text.secondary",
                  maxWidth: 640,
                }}
              >
                Feito para motorista de app, entregador de moto e ciclista.
                Veja quanto entra, quanto sai e quanto realmente sobra,
                de forma clara, prática e profissional.
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

                {settings.subscriptionMode.enabled ? (
                  <Button
                    component={RouterLink}
                    to="/subscription"
                    variant="outlined"
                    color="success"
                    size="large"
                    startIcon={<WorkspacePremiumRoundedIcon />}
                  >
                    Ver Premium
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
                    <Box sx={{ p: 2.5, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="body2" color="text.secondary">
                        Ganho bruto
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {formatCurrency(4580)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="body2" color="text.secondary">
                        Lucro líquido
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {formatCurrency(3210)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 2.5, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
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

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<SavingsRoundedIcon />}
              title="Saiba quanto realmente sobra"
              description="Veja seu bruto, seus gastos e o lucro líquido em um painel simples, sem fazer conta manual."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<QueryStatsRoundedIcon />}
              title="Acompanhe sua evolução"
              description="Compare períodos, descubra seus melhores dias e entenda se está valendo a pena continuar da mesma forma."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard
              icon={<ReceiptLongRoundedIcon />}
              title="Controle seus custos do dia a dia"
              description="Anote comida, conta, parcela, locação e outros gastos para enxergar o seu resultado real."
            />
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={800}>
                Feito para ser claro até para quem não gosta de planilha.
              </Typography>
              <Typography color="text.secondary">
                O objetivo do app é simples: ajudar você a parar de trabalhar no escuro
                e começar a tomar decisões com base em números reais.
              </Typography>
              <Typography color="text.secondary">
                Você registra ganhos, registra gastos e acompanha o que realmente está sobrando.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard
              icon={<SecurityRoundedIcon />}
              title="Mais organização e mais controle"
              description="Cada usuário tem conta própria, painel individual e permissões controladas para manter tudo seguro e organizado."
            />
          </Grid>
        </Grid>
      </Container>

      {settings.subscriptionMode.enabled ? (
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              bgcolor: "success.main",
              color: "white",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={800}>
                    Libere os recursos premium quando quiser
                  </Typography>
                  <Typography sx={{ opacity: 0.92 }}>
                    Relatórios avançados, cálculo automático de combustível, R$/KM e R$/hora.
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  component={RouterLink}
                  to="/subscription"
                  variant="contained"
                  color="inherit"
                  sx={{ color: "success.main" }}
                  fullWidth
                >
                  Ver planos
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      ) : null}

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: 2 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
              {settings.subscriptionMode.enabled ? (
                <Link component={RouterLink} to="/subscription" underline="hover">
                  Assinatura
                </Link>
              ) : null}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}