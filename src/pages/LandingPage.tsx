import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import PedalBikeRoundedIcon from "@mui/icons-material/PedalBikeRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import { Link as RouterLink } from "react-router-dom";

function HeroMockCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(128,128,128,0.16)",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700}>Resumo do mês</Typography>
          <Chip size="small" color="success" label="Premium liberado" />
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, height: "100%" }}
            >
              <Typography variant="body2" color="text.secondary">
                Ganho bruto
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                R$ 4.580,00
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, height: "100%" }}
            >
              <Typography variant="body2" color="text.secondary">
                Lucro líquido
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                R$ 3.210,00
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3 }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ganhos por dia
              </Typography>

              <Box
                sx={{
                  height: 110,
                  display: "flex",
                  alignItems: "end",
                  gap: 1,
                }}
              >
                {[45, 78, 62, 92, 70, 88, 55].map((value, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      height: `${value}%`,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      opacity: 0.9 - index * 0.05,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 4,
        height: "100%",
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ color: "primary.main" }}>{icon}</Box>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  );
}

export function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/login" variant="text">
                Entrar
              </Button>
              <Button component={RouterLink} to="/cadastro" variant="contained">
                Criar conta
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <Chip
                icon={<TrendingUpRoundedIcon />}
                label="Controle simples para quem vive na rua trabalhando"
                color="primary"
                variant="outlined"
                sx={{ width: "fit-content" }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "3.2rem" },
                  lineHeight: 1.05,
                  fontWeight: 800,
                }}
              >
                Organize seus ganhos, gastos e resultado real em um só lugar.
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontWeight: 400, fontSize: { xs: "1rem", md: "1.15rem" } }}
              >
                Feito para motorista de app, entregador de moto e ciclista.
                Acompanhe seu desempenho diário, mensal e anual com um painel
                bonito, rápido e fácil de usar.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/cadastro"
                  size="large"
                  variant="contained"
                >
                  Começar agora
                </Button>

                <Button
                  component={RouterLink}
                  to="/login"
                  size="large"
                  variant="outlined"
                >
                  Já tenho conta
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<DirectionsCarRoundedIcon />} label="Carro" />
                <Chip icon={<TwoWheelerRoundedIcon />} label="Moto" />
                <Chip icon={<PedalBikeRoundedIcon />} label="Bike" />
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <HeroMockCard />
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 6, md: 9 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <BenefitCard
                icon={<SavingsRoundedIcon />}
                title="Saiba quanto realmente sobra"
                description="Veja seu bruto, seus gastos e o lucro líquido sem planilhas complicadas."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <BenefitCard
                icon={<QueryStatsRoundedIcon />}
                title="Acompanhe sua evolução"
                description="Compare períodos, identifique dias mais fortes e tome decisões melhores."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <BenefitCard
                icon={<PhoneIphoneRoundedIcon />}
                title="Pensado para celular"
                description="Layout mobile-first para usar no dia a dia, direto do telefone."
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}