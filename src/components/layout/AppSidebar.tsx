import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";

const drawerWidth = 240;
const drawerCollapsed = 72;

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  premium?: boolean;
  adminOnly?: boolean;
};

type Props = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AppSidebar({ mobileOpen, onCloseMobile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const appMode = profile?.app_mode ?? "driver";
  const isBasicMode = appMode === "basic";

  const navItems = useMemo<NavItem[]>(() => {
    const common: NavItem[] = [
      {
        label: isBasicMode ? "Visão geral" : "Dashboard",
        path: "/dashboard",
        icon: <DashboardRoundedIcon />,
      },
      {
        label: isBasicMode ? "Entradas" : "Ganhos",
        path: "/earnings",
        icon: isBasicMode ? <WalletRoundedIcon /> : <PaidRoundedIcon />,
      },
      {
        label: isBasicMode ? "Saídas" : "Gastos",
        path: "/expenses",
        icon: <ReceiptLongRoundedIcon />,
      },
      {
        label: isBasicMode ? "Análises" : "Relatórios",
        path: "/reports",
        icon: <InsightsRoundedIcon />,
        premium: true,
      },
      {
        label: "Suporte",
        path: "/contact",
        icon: <MailOutlineRoundedIcon />,
      },
      {
        label: "Configurações",
        path: "/settings",
        icon: <SettingsRoundedIcon />,
      },
    ];

    common.push({
      label: "Admin",
      path: "/admin",
      icon: <AdminPanelSettingsRoundedIcon />,
      adminOnly: true,
    });

    return common;
  }, [isBasicMode]);

  const width = collapsed ? drawerCollapsed : drawerWidth;

  const visibleItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.adminOnly) {
        return Boolean(profile?.is_admin);
      }

      return true;
    });
  }, [navItems, profile]);

  const modeLabel = isBasicMode
    ? "Controle essencial"
    : "Gestão para motoristas";

  const modeIcon = isBasicMode ? (
    <WalletRoundedIcon fontSize="small" />
  ) : (
    <DirectionsCarFilledRoundedIcon fontSize="small" />
  );

  const content = (
    <Box
      sx={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: collapsed ? "center" : "flex-start",
          justifyContent: "space-between",
          gap: 1,
          px: collapsed ? 0 : 1,
          pb: 1,
        }}
      >
        {!collapsed ? (
          <Box>
            <Typography variant="h6" fontWeight={700}>
              MotoristaParceiro
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {isBasicMode
                ? "Controle financeiro inteligente"
                : "Gestão operacional e financeira"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {modeIcon}
          </Box>
        )}

        <IconButton
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{ alignSelf: collapsed ? "center" : "flex-start" }}
        >
          {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
        </IconButton>
      </Box>

      {!collapsed ? (
        <Box sx={{ px: 1, pb: 1.5 }}>
          <Chip
            icon={modeIcon}
            label={modeLabel}
            size="small"
            color={isBasicMode ? "default" : "primary"}
            variant={isBasicMode ? "outlined" : "filled"}
          />
        </Box>
      ) : null}

      <Divider sx={{ mb: 1.5 }} />

      <List sx={{ p: 0 }}>
        {visibleItems.map((item) => {
          const selected =
            location.pathname === item.path ||
            (item.path === "/admin" && location.pathname.startsWith("/admin"));

          const button = (
            <ListItemButton
              selected={selected}
              onClick={() => {
                navigate(item.path);
                onCloseMobile();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                justifyContent: collapsed ? "center" : "flex-start",
                minHeight: 46,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed ? (
                <ListItemText
                  primary={item.label}
                  secondary={item.premium ? "Premium" : undefined}
                />
              ) : null}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              <Box>{button}</Box>
            </Tooltip>
          ) : (
            <Box key={item.path}>{button}</Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        open={mobileOpen}
        onClose={onCloseMobile}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        open
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}