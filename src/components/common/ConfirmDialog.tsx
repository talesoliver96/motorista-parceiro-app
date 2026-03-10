import { Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { AppDialog } from "./AppDialog";

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  loading = false,
  title,
  description,
  onClose,
  onConfirm,
  children,
}: Props) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <DialogActions sx={{ px: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
            Confirmar
          </Button>
        </DialogActions>
      }
    >
      <DialogTitle sx={{ px: 0, pt: 0 }}>{title}</DialogTitle>

      <DialogContent sx={{ px: 0 }}>
        <Typography color="text.secondary" sx={{ mb: children ? 2 : 0 }}>
          {description}
        </Typography>

        {children}
      </DialogContent>
    </AppDialog>
  );
}