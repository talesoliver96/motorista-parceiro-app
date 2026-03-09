import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from "@mui/material";

type Props = DialogProps & {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

// Modal padrão do app.
// Centraliza estrutura visual para reaproveitar em ganhos, gastos e outros formulários.
export function AppDialog({
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  ...props
}: Props) {
  return (
    <Dialog maxWidth={maxWidth} fullWidth={fullWidth} {...props}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
}