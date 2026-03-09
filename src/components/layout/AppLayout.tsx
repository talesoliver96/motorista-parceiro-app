import { Box } from "@mui/material";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type Props = {
  children: React.ReactNode;
};

export function AppLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <AppHeader onOpenMobileMenu={() => setMobileOpen(true)} />
        {children}
      </Box>
    </Box>
  );
}