import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useAppTheme } from "../../app/providers/AppThemeProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { authService } from "../../features/auth/auth.service";

type Props = {
  onOpenMobileMenu: () => void;
};

function getPageTitle(pathname: string, appMode: "driver" | "basic") {
  const isBasicMode = appMode === "basic";

  const pageTitleMap: Record<string, string> = {
    "/dashboard": isBasicMode ? "Visão geral" : "Dashboard",
    "/earnings": isBasicMode ? "Entradas" : "Ganhos",
    "/expenses": isBasicMode ? "Saídas" : "Gastos",
    "/reports": isBasicMode ? "Análises" : "Relatórios",
    "/settings": "Configurações",
    "/contact": "Suporte",
    "/admin": "Dashboard Admin",
    "/admin/users": "Administração de usuários",
    "/admin/system-settings": "Configurações do sistema",
  };

  return pageTitleMap[pathname] || "MotoristaParceiro";
}

export function AppHeader({ onOpenMobileMenu }: Props) {
  const { mode, toggleTheme } = useAppTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();
  const location = useLocation();

  const appMode = profile?.app_mode ?? "driver";
  const isBasicMode = appMode === "basic";

  const title = getPageTitle(location.pathname, appMode);

  const handleLogout = async () => {
    try {
      await authService.signOut();

      enqueueSnackbar("Você saiu da conta", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);

      enqueueSnackbar("Não foi possível sair agora", {
        variant: "error",
      });
    }
  };

  return (
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
      <Container maxWidth={false}>
        <Toolbar sx={{ px: { xs: 0, sm: 1 } }}>
          <IconButton
            onClick={onOpenMobileMenu}
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {title}
              </Typography>

              <Chip
                size="small"
                icon={
                  isBasicMode ? (
                    <WalletRoundedIcon fontSize="small" />
                  ) : (
                    <DirectionsCarFilledRoundedIcon fontSize="small" />
                  )
                }
                label={
                  isBasicMode
                    ? "Controle essencial"
                    : "Gestão para motoristas"
                }
                variant={isBasicMode ? "outlined" : "filled"}
                color={isBasicMode ? "default" : "primary"}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" noWrap>
              {isBasicMode
                ? "Entradas, saídas, saldo e total disponível."
                : "Ganhos, gastos, operação e performance financeira."}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={toggleTheme}>
              {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>

            <IconButton onClick={() => void handleLogout()}>
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}