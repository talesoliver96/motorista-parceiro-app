import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
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
        height: "100%",
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ color: "primary.main", display: "inline-flex" }}>{props.icon}</Box>

        <Typography variant="h6">{props.title}</Typography>

        <Typography color="text.secondary">{props.description}</Typography>
      </Stack>
    </Box>
  );
}

function AudienceCard(props: {
  icon: React.ReactNode;
  chipLabel: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: "primary.main", display: "inline-flex" }}>{props.icon}</Box>
          <Chip label={props.chipLabel} size="small" color="primary" variant="outlined" />
        </Stack>

        <Typography variant="h5">{props.title}</Typography>

        <Typography color="text.secondary">{props.description}</Typography>

        <Stack spacing={1}>
          {props.bullets.map((bullet) => (
            <Typography key={bullet} variant="body2" color="text.secondary">
              • {bullet}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function MockMetricCard(props: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {props.title}
      </Typography>

      <Typography variant="h5" sx={{ mt: 0.5 }}>
        {props.value}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {props.caption}
      </Typography>
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
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              px: { xs: 0, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack spacing={0}>
              <Typography variant="h6" fontWeight={700}>
                MotoristaParceiro
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gestão para motoristas e controle financeiro essencial
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
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
                  Ir para o painel
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login">
                    Entrar
                  </Button>

                  <Button component={RouterLink} to="/register" variant="contained">
                    Criar conta
                  </Button>
                </>
              )}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Chip
                label="Uma plataforma, dois perfis de uso"
                color="primary"
                variant="outlined"
                sx={{ width: "fit-content" }}
              />

              <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 52 }, fontWeight: 700 }}>
                Controle financeiro com visão profissional.
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Use o MotoristaParceiro para acompanhar entradas, saídas, saldo e
                resultado real — com uma experiência especializada para motoristas
                de app e outra focada em controle financeiro essencial.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to={user ? "/dashboard" : "/register"}
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
                    variant="text"
                    size="large"
                  >
                    Ver Premium
                  </Button>
                ) : null}
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<DirectionsCarRoundedIcon />} label="Motoristas de app" />
                <Chip icon={<WalletRoundedIcon />} label="Controle financeiro essencial" />
                <Chip icon={<ReceiptLongRoundedIcon />} label="Entradas, saídas e saldo" />
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={2.5}>
                <Typography variant="h6">Exemplo de visão geral</Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MockMetricCard
                      title="Entradas no período"
                      value={formatCurrency(4580)}
                      caption="Total registrado"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MockMetricCard
                      title="Gastos no período"
                      value={formatCurrency(1370)}
                      caption="Saídas consideradas"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MockMetricCard
                      title="Resultado líquido"
                      value={formatCurrency(3210)}
                      caption="Entradas - gastos"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <MockMetricCard
                      title="Saldo disponível"
                      value={formatCurrency(4210)}
                      caption="Carteira + resultado"
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    A mesma plataforma pode funcionar como gestão operacional para
                    motoristas ou como um painel financeiro limpo e objetivo para
                    quem só quer controlar dinheiro de forma simples.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h4">Escolha a experiência ideal para o seu perfil</Typography>
          <Typography color="text.secondary">
            No cadastro, cada usuário seleciona a jornada que faz mais sentido para
            seu contexto de uso.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AudienceCard
              icon={<DirectionsCarRoundedIcon />}
              chipLabel="Modo Driver"
              title="Gestão para motoristas"
              description="Perfeito para motoristas de aplicativo que precisam entender a operação e o resultado financeiro com mais profundidade."
              bullets={[
                "Ganhos e gastos por período",
                "KM, combustível e indicadores operacionais",
                "Resultado líquido com mais precisão",
                "Recursos premium para leitura avançada",
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AudienceCard
              icon={<WalletRoundedIcon />}
              chipLabel="Modo Essential"
              title="Controle financeiro essencial"
              description="Ideal para quem quer registrar entradas, saídas, saldo e total disponível sem complexidade desnecessária."
              bullets={[
                "Entradas e saídas organizadas",
                "Saldo / carteira opcional",
                "Visão geral objetiva do período",
                "Experiência limpa, elegante e prática",
              ]}
            />
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={3} sx={{ mb: 4 }}>
            <Typography variant="h4">Por que usar o MotoristaParceiro?</Typography>
            <Typography color="text.secondary">
              O objetivo é simples: parar de tomar decisão no escuro e começar a
              acompanhar números reais com clareza.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<SavingsRoundedIcon />}
                title="Resultado real do período"
                description="Veja claramente quanto entrou, quanto saiu e quanto realmente sobrou."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<InsightsRoundedIcon />}
                title="Leitura simples e profissional"
                description="Acompanhe evolução, compare períodos e enxergue sua rotina financeira com mais maturidade."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<ReceiptLongRoundedIcon />}
                title="Mais disciplina no controle"
                description="Registre despesas, entradas e saldo em um fluxo centralizado, sem depender de planilhas soltas."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<QueryStatsRoundedIcon />}
                title="Indicadores para decidir melhor"
                description="Entenda se a operação está valendo a pena e onde estão seus principais pontos de atenção."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<SecurityRoundedIcon />}
                title="Conta individual e organizada"
                description="Cada usuário possui seu próprio ambiente, mantendo informações separadas e melhor controladas."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard
                icon={<PaidRoundedIcon />}
                title="Saldo e visão de disponibilidade"
                description="Acompanhe não apenas o resultado do período, mas também quanto está disponível para o dia a dia."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {settings.subscriptionMode.enabled ? (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WorkspacePremiumRoundedIcon color="warning" />
                    <Typography variant="h5">Leve sua gestão para um nível mais avançado</Typography>
                  </Stack>

                  <Typography color="text.secondary">
                    Libere recursos premium como relatórios avançados, métricas
                    operacionais para motoristas, cálculo automático de combustível e
                    leituras mais completas do desempenho financeiro.
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack alignItems={{ xs: "stretch", md: "flex-end" }}>
                  <Button
                    component={RouterLink}
                    to="/subscription"
                    variant="contained"
                    size="large"
                  >
                    Ver planos
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Container>
      ) : null}

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
            <Typography color="text.secondary">
              © {new Date().getFullYear()} MotoristaParceiro. Gestão para motoristas
              e controle financeiro essencial.
            </Typography>

            <Stack direction="row" spacing={2}>
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