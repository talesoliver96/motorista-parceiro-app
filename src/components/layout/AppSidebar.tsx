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

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Ganhos", path: "/earnings", icon: <PaidRoundedIcon /> },
  { label: "Gastos", path: "/expenses", icon: <ReceiptLongRoundedIcon /> },
  { label: "Contato", path: "/contact", icon: <MailOutlineRoundedIcon /> },
  { label: "Configurações", path: "/settings", icon: <SettingsRoundedIcon /> },
  {
    label: "Relatórios",
    path: "/reports",
    icon: <InsightsRoundedIcon />,
    premium: true,
  },
  {
    label: "Admin",
    path: "/admin",
    icon: <AdminPanelSettingsRoundedIcon />,
    adminOnly: true,
  },
];

type Props = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AppSidebar({ mobileOpen, onCloseMobile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? drawerCollapsed : drawerWidth;

  const visibleItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.adminOnly) {
        return Boolean(profile?.is_admin);
      }

      return true;
    });
  }, [profile]);

  const content = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 2,
        }}
      >
        {!collapsed && (
          <Typography fontWeight={700}>MotoristaParceiro</Typography>
        )}

        <IconButton onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
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

              {!collapsed && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 1,
                  }}
                >
                  <ListItemText primary={item.label} />
                  {item.premium ? (
                    <Chip
                      size="small"
                      label="Premium"
                      color="success"
                      variant="outlined"
                    />
                  ) : null}
                </Box>
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip
              key={item.path}
              title={item.premium ? `${item.label} • Premium` : item.label}
              placement="right"
            >
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
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
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
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            overflowX: "hidden",
            transition: "width .2s ease",
            boxSizing: "border-box",
            borderRight: "1px solid rgba(128,128,128,0.12)",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}