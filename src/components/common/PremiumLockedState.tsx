import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { AppCard } from "./AppCard";
import { useNavigate } from "react-router-dom";

type Props = {
  title?: string;
  description?: string;
};

export function PremiumLockedState({
  title = "Recurso Premium",
  description = "Este recurso está disponível apenas para usuários premium.",
}: Props) {
  const navigate = useNavigate();

  return (
    <AppCard>
      <Stack spacing={2} alignItems="flex-start">
        <Alert icon={<WorkspacePremiumRoundedIcon />} severity="success">
          Premium
        </Alert>

        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>

        <Button variant="contained" onClick={() => navigate("/contact")}>
          Quero liberar este recurso
        </Button>
      </Stack>
    </AppCard>
  );
}