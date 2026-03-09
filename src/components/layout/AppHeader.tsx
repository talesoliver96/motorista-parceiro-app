import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAppTheme } from "../../app/providers/AppThemeProvider";
import { authService } from "../../features/auth/auth.service";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";

type Props = {
  onOpenMobileMenu: () => void;
};

const pageTitleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/earnings": "Ganhos",
  "/expenses": "Gastos",
  "/reports": "Relatórios",
  "/settings": "Configurações",
  "/contact": "Contato",
};

export function AppHeader({ onOpenMobileMenu }: Props) {
  const { mode, toggleTheme } = useAppTheme();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const title = pageTitleMap[location.pathname] || "MotoristaParceiro";

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
        borderBottom: "1px solid rgba(128,128,128,0.12)",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: 64, px: "0 !important" }}>
          <IconButton
            onClick={onOpenMobileMenu}
            edge="start"
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton onClick={toggleTheme}>
              {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>

            <IconButton onClick={handleLogout}>
              <LogoutRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}