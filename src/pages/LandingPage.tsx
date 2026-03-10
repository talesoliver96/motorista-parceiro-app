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
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
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
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Typography variant="h6">{title}</Typography>

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
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Chip label={chip} color="primary" variant="outlined" size="small" />
        </Stack>

        <Typography variant="h5">{title}</Typography>
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

      <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
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
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 700,
          }}
        >
          {number}
        </Box>

        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Box>
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
      { label: "Perfis de uso", href: "#perfis" },
      { label: "Recursos", href: "#recursos" },
      { label: "Premium", href: "#premium" },
    ],
    []
  );

  const NavLinks = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, md: 2 }}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          underline="none"
          color="text.primary"
          sx={{
            fontWeight: 500,
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
          bgcolor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: "blur(12px)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 76 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                MP
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                  MotoristaParceiro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gestão para motoristas e controle financeiro essencial
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: { xs: "none", md: "block" } }}>{NavLinks}</Box>

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
                Criar conta
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
              Menu
            </Typography>

            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider />

          {NavLinks}

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
              Criar conta
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(25,118,210,0.06) 0%, rgba(25,118,210,0.00) 100%)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2.5}>
                <Chip
                  label="30 dias grátis para testar a plataforma"
                  color="success"
                  variant="outlined"
                  sx={{ width: "fit-content", fontWeight: 600 }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: 38, md: 60 },
                    lineHeight: 1.05,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Controle seu dinheiro com mais clareza, precisão e visão de negócio.
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 400, maxWidth: 640 }}
                >
                  O MotoristaParceiro ajuda motoristas de aplicativo e usuários de
                  controle financeiro essencial a entender entradas, gastos, saldo,
                  lucro real e desempenho do período em uma plataforma moderna,
                  prática e profissional.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={user ? "/dashboard" : "/register"}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    {user ? "Abrir meu painel" : "Começar teste grátis"}
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
                  boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
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
                        Visão geral do período
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        Resultado financeiro
                      </Typography>
                    </Box>

                    <Chip label="Exemplo" size="small" variant="outlined" />
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Entradas"
                        value={formatCurrency(5480)}
                        caption="Movimentação bruta registrada"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Gastos"
                        value={formatCurrency(1820)}
                        caption="Saídas consideradas no período"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Resultado líquido"
                        value={formatCurrency(3660)}
                        caption="Entradas menos gastos"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetricCard
                        title="Saldo disponível"
                        value={formatCurrency(4660)}
                        caption="Carteira + resultado líquido"
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Uma única plataforma para acompanhar seu dinheiro com muito mais
                      clareza — seja em uma rotina operacional de motorista ou em um
                      uso financeiro mais simples e objetivo.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="como-funciona" maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Como funciona
          </Typography>
          <Typography color="text.secondary">
            O objetivo do produto é transformar movimentação financeira em leitura
            prática para decisão.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="1"
              title="Escolha sua experiência"
              description="No cadastro, você define se quer usar a plataforma como motorista de app ou como controle financeiro essencial."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="2"
              title="Registre entradas e gastos"
              description="Lance sua movimentação do jeito que fizer mais sentido para a sua rotina, com uma interface clara e organizada."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StepCard
              number="3"
              title="Acompanhe o resultado real"
              description="Veja lucro líquido, saldo disponível, relatórios e indicadores para ter mais controle sobre o seu dinheiro."
            />
          </Grid>
        </Grid>
      </Container>

      <Box id="perfis" sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>
              Dois perfis de uso, uma plataforma profissional
            </Typography>
            <Typography color="text.secondary">
              O sistema se adapta ao seu contexto sem virar uma bagunça visual.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AudienceCard
                icon={<DirectionsCarRoundedIcon />}
                chip="Modo Driver"
                title="Gestão para motoristas"
                description="Ideal para motoristas de aplicativo que querem enxergar melhor a operação e o lucro real."
                bullets={[
                  "Ganhos e gastos por período",
                  "KM rodado e leitura operacional",
                  "Combustível automático com compensação inteligente",
                  "Relatórios premium para análise mais profunda",
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AudienceCard
                icon={<WalletRoundedIcon />}
                chip="Modo Essential"
                title="Controle financeiro essencial"
                description="Perfeito para quem quer registrar entradas, saídas e saldo com uma experiência limpa e objetiva."
                bullets={[
                  "Entradas e saídas organizadas",
                  "Saldo / carteira opcional",
                  "Visão clara do total disponível",
                  "Experiência simples, elegante e funcional",
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="recursos" maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Recursos que ajudam você a decidir melhor
          </Typography>
          <Typography color="text.secondary">
            Não é só registrar números. É entender o que eles significam.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<ReceiptLongRoundedIcon />}
              title="Entradas e gastos organizados"
              description="Cadastre sua movimentação com praticidade e mantenha tudo centralizado em um só lugar."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SavingsRoundedIcon />}
              title="Saldo e total disponível"
              description="Acompanhe não só o resultado do período, mas também quanto está disponível para o seu dia a dia."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<InsightsRoundedIcon />}
              title="Dashboard com leitura objetiva"
              description="Veja rapidamente o que entrou, o que saiu, o que sobrou e onde está o impacto principal."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<LocalGasStationRoundedIcon />}
              title="Combustível automático"
              description="No modo motorista, estime custo de combustível por ganho e compense abastecimentos manuais sem duplicidade."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<QueryStatsRoundedIcon />}
              title="Relatórios avançados"
              description="Entenda melhor o comportamento financeiro do período com gráficos, indicadores e melhores resultados líquidos."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SecurityRoundedIcon />}
              title="Estrutura profissional"
              description="Usuários, assinatura, painel admin, configurações e organização para crescer o produto com mais segurança."
            />
          </Grid>
        </Grid>
      </Container>

      <Box id="premium" sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2}>
                <Chip
                  icon={<StarRoundedIcon />}
                  label="30 dias grátis para testar"
                  color="warning"
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                />

                <Typography variant="h4" fontWeight={800}>
                  Teste a plataforma por 30 dias e entenda se ela faz sentido para a sua rotina.
                </Typography>

                <Typography color="text.secondary">
                  Você pode experimentar o produto, registrar sua movimentação e
                  avaliar na prática o ganho de clareza e organização antes de tomar
                  qualquer decisão.
                </Typography>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
                    <Typography color="text.secondary">
                      Acesso inicial para conhecer a plataforma com calma
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
                    <Typography color="text.secondary">
                      Recursos premium para aprofundar sua leitura financeira
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
                    <Typography color="text.secondary">
                      Mais clareza para decidir sobre dinheiro, custos e resultado real
                    </Typography>
                  </Stack>
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
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h5" fontWeight={700}>
                    Premium
                  </Typography>

                  <Typography color="text.secondary">
                    Ideal para quem quer uma leitura mais estratégica e recursos mais completos.
                  </Typography>

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
                  </Stack>

                  <Button
                    component={RouterLink}
                    to={user ? "/dashboard" : "/register"}
                    variant="contained"
                    size="large"
                  >
                    {user ? "Abrir painel" : "Começar meu teste"}
                  </Button>

                  {settings.subscriptionMode.enabled ? (
                    <Button component={RouterLink} to="/subscription">
                      Ver detalhes da assinatura
                    </Button>
                  ) : null}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.10) 0%, rgba(25,118,210,0.03) 100%)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.5}>
                <Typography variant="h4" fontWeight={800}>
                  Chega de controlar tudo no escuro.
                </Typography>

                <Typography color="text.secondary">
                  Organize sua rotina financeira, acompanhe seu resultado real e use
                  uma plataforma com aparência e estrutura muito mais profissional.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack
                direction={{ xs: "column", sm: "row", md: "column" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "stretch" }}
              >
                <Button
                  component={RouterLink}
                  to={user ? "/dashboard" : "/register"}
                  variant="contained"
                  size="large"
                >
                  {user ? "Ir para o painel" : "Criar minha conta"}
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
              <Typography fontWeight={700}>MotoristaParceiro</Typography>
              <Typography variant="body2" color="text.secondary">
                Gestão para motoristas e controle financeiro essencial.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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