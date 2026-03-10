import { Box, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>

            {subtitle ? (
              <Typography color="text.secondary">{subtitle}</Typography>
            ) : null}
          </Stack>

          {children}

          {footer ? <Box>{footer}</Box> : null}
        </Stack>
      </Paper>
    </Box>
  );
}