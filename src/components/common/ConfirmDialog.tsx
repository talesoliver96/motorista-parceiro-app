import { Button, Typography } from "@mui/material";
import { AppDialog } from "./AppDialog";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

// Modal padrão de confirmação.
// Reutilizado para exclusões.
export function ConfirmDialog({
  open,
  title = "Confirmar ação",
  description = "Tem certeza que deseja continuar?",
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            disabled={loading}
          >
            Excluir
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </AppDialog>
  );
}