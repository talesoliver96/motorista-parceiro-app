import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";
import { usePublicAppSettings } from "../features/app-settings/usePublicAppSettings";
import { formatCurrency } from "../features/earnings/earnings.utils";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 16px 40px rgba(0,0,0,0.05)",
      }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.10),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Box>
  );
}

type AudienceCardProps = {
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
  bullets: string[];
};

function AudienceCard({
  icon,
  chip,
  title,
  description,
  bullets,
}: AudienceCardProps) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 16px 40px rgba(0,0,0,0.05)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.10),
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Chip label={chip} color="primary" variant="outlined" size="small" />
        </Stack>

        <Typography variant="h5" fontWeight={800}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>

        <Stack spacing={1}>
          {bullets.map((bullet) => (
            <Stack key={bullet} direction="row" spacing={1} alignItems="flex-start">
              <CheckCircleRoundedIcon
                sx={{ fontSize: 18, color: "success.main", mt: "2px" }}
              />
              <Typography variant="body2" color="text.secondary">
                {bullet}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  caption: string;
};

function MetricCard({ title, value, caption }: MetricCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
        {value}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    </Box>
  );
}

type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 800,
          }}
        >
          {number}
        </Box>

        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Box>
  );
}

type PlanFeatureProps = {
  text: string;
};

function PlanFeature({ text }: PlanFeatureProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 18 }} />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const { settings } = usePublicAppSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const menuItems = useMemo(
    () => [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Perfis", href: "#perfis" },
      { label: "Recursos", href: "#recursos" },
      { label: "Plano", href: "#plano" },
    ],
    []
  );

  const navLinks = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, md: 2.5 }}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          underline="none"
          color="text.primary"
          sx={{
            fontWeight: 600,
            py: { xs: 1, md: 0 },
          }}
          onClick={() => setMobileOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.86),
          backdropFilter: "blur(12px)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 78 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 18,
                  boxShadow: "0 10px 24px rgba(25,118,210,0.35)",
                }}
              >
                MP
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                  MotoristaParceiro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gestão financeira inteligente
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: { xs: "none", md: "block" } }}>{navLinks}</Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ ml: 3, display: { xs: "none", md: "flex" } }}
            >
              <Button component={RouterLink} to="/login">
                Entrar
              </Button>

              <Button component={RouterLink} to="/register" variant="contained">
                Testar grátis
              </Button>
            </Stack>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 320,
            p: 2,
            boxSizing: "border-box",
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Navegação
            </Typography>

            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider />
          {navLinks}
          <Divider />

          <Stack spacing={1}>
            <Button component={RouterLink} to="/login" onClick={() => setMobileOpen(false)}>
              Entrar
            </Button>

            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              onClick={() => setMobileOpen(false)}
            >
              Testar grátis
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(25,118,210,0.14) 0%, rgba(25,118,210,0.04) 28%, rgba(25,118,210,0) 56%)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2.5}>
                <Chip
                  icon={<StarRoundedIcon />}
                  label="Sistema gratuito + 30 dias grátis de Premium para testar"
                  color="warning"
                  variant="outlined"
                  sx={{ width: "fit-content", fontWeight: 700 }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: 40, md: 64 },
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    maxWidth: 760,
                  }}
                >
                  Pare de adivinhar seus números.
                  <Box component="span" sx={{ color: "primary.main", display: "block" }}>
                    Comece a entender seu resultado real.
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 400, maxWidth: 650 }}
                >
                  O MotoristaParceiro é uma plataforma moderna para organizar entradas,
                  gastos, saldo, total disponível e desempenho do período — com uma
                  experiência especializada para motoristas e outra focada em
                  controle financeiro essencial.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={user ? "/dashboard" : "/register"}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    {user ? "Abrir meu painel" : "Criar conta grátis"}
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                  >
                    Já tenho conta
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<DirectionsCarRoundedIcon />} label="Modo Driver" />
                  <Chip icon={<WalletRoundedIcon />} label="Modo Essential" />
                  <Chip icon={<WorkspacePremiumRoundedIcon />} label="Premium opcional" />
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: "0 28px 90px rgba(0,0,0,0.10)",
                }}
              >
                <Stack spacing={2.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Painel financeiro
                      </Typography>
                      <Typography variant="h5" fontWeight={800}>
                        Visão geral do período
                      </Typography>
                    </Box>

                    <Chip label="Demonstração" size="small" variant="outlined" />
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Entradas"
                        value={formatCurrency(5480)}
                        caption="Movimentação registrada"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Gastos"
                        value={formatCurrency(1820)}
                        caption="Saídas consideradas"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Resultado líquido"
                        value={formatCurrency(3660)}
                        caption="Entradas - gastos"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Saldo disponível"
                        value={formatCurrency(4660)}
                        caption="Carteira + resultado"
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        O que você ganha com isso?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mais clareza, mais organização e muito menos decisão no escuro.
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="como-funciona" maxWidth="lg" sx={{ py: 9 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>
            Como a plataforma funciona
          </Typography>
          <Typography color="text.secondary">
            Um fluxo simples para organizar sua rotina e melhorar sua leitura financeira.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="1"
              title="Crie sua conta grátis"
              description="Você entra no sistema sem custo e escolhe a experiência que melhor se encaixa no seu perfil de uso."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="2"
              title="Registre sua movimentação"
              description="Lance entradas, gastos, saldo e, no modo motorista, acompanhe também a parte operacional."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="3"
              title="Leia seu resultado real"
              description="Use dashboard, relatórios e indicadores para enxergar com clareza o que está acontecendo com o seu dinheiro."
            />
          </Grid>
        </Grid>
      </Container>

      <Box
        id="perfis"
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 9 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800}>
              Dois perfis de uso. Uma base profissional.
            </Typography>
            <Typography color="text.secondary">
              A plataforma se adapta ao seu contexto sem ficar genérica demais.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AudienceCard
                icon={<DirectionsCarRoundedIcon />}
                chip="Modo Driver"
                title="Gestão para motoristas"
                description="Ideal para motoristas de aplicativo que querem acompanhar operação, gastos, combustível e lucro real com mais profundidade."
                bullets={[
                  "Ganhos e gastos por período",
                  "KM rodado e indicadores operacionais",
                  "Combustível automático com compensação inteligente",
                  "Relatórios premium para leitura mais estratégica",
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AudienceCard
                icon={<WalletRoundedIcon />}
                chip="Modo Essential"
                title="Controle financeiro essencial"
                description="Perfeito para quem quer registrar entradas, saídas e saldo com uma experiência limpa, moderna e objetiva."
                bullets={[
                  "Entradas e saídas organizadas",
                  "Saldo / carteira opcional",
                  "Total disponível com leitura clara",
                  "Experiência simples, elegante e prática",
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="recursos" maxWidth="lg" sx={{ py: 9 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>
            Recursos pensados para clareza e decisão
          </Typography>
          <Typography color="text.secondary">
            Não é só lançar números. É conseguir interpretar o que eles mostram.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<ReceiptLongRoundedIcon />}
              title="Entradas e gastos organizados"
              description="Registre sua movimentação com praticidade e mantenha tudo centralizado em uma única plataforma."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SavingsRoundedIcon />}
              title="Saldo e total disponível"
              description="Acompanhe não só o resultado do período, mas também quanto está disponível para uso real."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<InsightsRoundedIcon />}
              title="Dashboard com leitura objetiva"
              description="Veja rapidamente o que entrou, o que saiu e qual foi o resultado líquido do período."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<LocalGasStationRoundedIcon />}
              title="Combustível automático"
              description="No modo motorista, estime custo de combustível por ganho e evite duplicidade com compensação inteligente."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<AutoGraphRoundedIcon />}
              title="Relatórios avançados"
              description="Use análises premium para aprofundar a leitura financeira e identificar melhores dias e padrões."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SecurityRoundedIcon />}
              title="Estrutura de SaaS"
              description="Usuários, painel admin, assinatura, configurações e organização para uma operação mais profissional."
            />
          </Grid>
        </Grid>
      </Container>

      <Box
        id="plano"
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 9 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2}>
                <Chip
                  icon={<BoltRoundedIcon />}
                  label="Gratuito para começar"
                  color="success"
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                />

                <Typography variant="h4" fontWeight={900}>
                  Comece grátis. Evolua para o Premium quando quiser mais profundidade.
                </Typography>

                <Typography color="text.secondary">
                  O sistema pode ser usado gratuitamente para organizar sua rotina
                  financeira. Para quem quiser ir além, o Premium libera recursos mais
                  avançados e ainda oferece <strong>30 dias grátis para teste</strong>.
                </Typography>

                <Stack spacing={1.2}>
                  <PlanFeature text="Uso gratuito para organizar entradas, gastos e saldo" />
                  <PlanFeature text="Premium com relatórios avançados e recursos extras" />
                  <PlanFeature text="30 dias grátis de Premium para testar a experiência completa" />
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
                }}
              >
                <Stack spacing={2.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={800}>
                      Premium
                    </Typography>
                    <Typography color="text.secondary">
                      Para quem quer mais profundidade, leitura estratégica e automações.
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkspacePremiumRoundedIcon color="warning" fontSize="small" />
                      <Typography variant="body2">Relatórios avançados</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUpRoundedIcon color="primary" fontSize="small" />
                      <Typography variant="body2">Indicadores extras de desempenho</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PaidRoundedIcon color="success" fontSize="small" />
                      <Typography variant="body2">Combustível automático no modo motorista</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <BalanceRoundedIcon color="info" fontSize="small" />
                      <Typography variant="body2">Leitura mais estratégica do período</Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      30 dias grátis de Premium para testar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experimente os recursos avançados e avalie na prática o ganho de clareza.
                    </Typography>
                  </Box>

                  <Button
                    component={RouterLink}
                    to={user ? "/dashboard" : "/register"}
                    variant="contained"
                    size="large"
                  >
                    {user ? "Abrir painel" : "Começar grátis"}
                  </Button>

                  {settings.subscriptionMode.enabled ? (
                    <Button component={RouterLink} to="/subscription">
                      Ver detalhes do Premium
                    </Button>
                  ) : null}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 9 }}>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.12) 0%, rgba(25,118,210,0.04) 100%)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.5}>
                <Chip
                  icon={<VerifiedRoundedIcon />}
                  label="Mais organização, mais clareza, mais controle"
                  color="primary"
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                />

                <Typography variant="h4" fontWeight={900}>
                  Uma plataforma para transformar movimentação em leitura real.
                </Typography>

                <Typography color="text.secondary">
                  Use gratuitamente, teste o Premium por 30 dias e descubra se o
                  MotoristaParceiro faz sentido para sua rotina financeira.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack
                direction={{ xs: "column", sm: "row", md: "column" }}
                spacing={1.5}
              >
                <Button
                  component={RouterLink}
                  to={user ? "/dashboard" : "/register"}
                  variant="contained"
                  size="large"
                >
                  {user ? "Ir para o painel" : "Criar conta grátis"}
                </Button>

                <Button component={RouterLink} to="/login" variant="outlined" size="large">
                  Entrar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography fontWeight={800}>MotoristaParceiro</Typography>
              <Typography variant="body2" color="text.secondary">
                Gestão para motoristas e controle financeiro essencial.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Link component={RouterLink} to="/public/contact" underline="hover">
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