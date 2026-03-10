import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { formatCurrency, formatDate } from "../../earnings/earnings.utils";
import { EmptyState } from "../../../components/common/EmptyState";
import { AppCard } from "../../../components/common/AppCard";
import type { ExpenseListItem } from "../expenses.types";

type Props = {
  items: ExpenseListItem[];
  onEdit: (item: ExpenseListItem) => void;
  onDelete: (item: ExpenseListItem) => void;
};

function renderValue(item: ExpenseListItem) {
  const originalAmount = Number(item.original_amount ?? item.amount ?? 0);
  const effectiveAmount = Number(item.amount ?? 0);
  const compensated = Number(item.compensated_automatic_fuel_amount ?? 0);

  if (item.source === "manual" && compensated > 0) {
    return (
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(effectiveAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Original: {formatCurrency(originalAmount)} • Compensado:{" "}
          {formatCurrency(compensated)}
        </Typography>
      </Stack>
    );
  }

  if (item.source === "automatic_fuel" && compensated > 0) {
    return (
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(effectiveAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Redução por compensação: {formatCurrency(compensated)}
        </Typography>
      </Stack>
    );
  }

  return formatCurrency(effectiveAmount);
}

export function ExpensesTable({ items, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!items.length) {
    return (
      <EmptyState
        title="Nenhum gasto encontrado"
        description="Cadastre gastos para acompanhar melhor seu resultado financeiro."
      />
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {items.map((item) => (
          <AppCard key={item.id}>
            <Stack spacing={1.25}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.category}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {formatDate(item.date)}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={item.source === "manual" ? "Manual" : "Automático"}
                  color={item.source === "manual" ? "default" : "info"}
                />
              </Stack>

              <Box>{renderValue(item)}</Box>

              {item.notes ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Observações
                  </Typography>

                  <Typography variant="body2">{item.notes}</Typography>
                </Box>
              ) : null}

              {item.source === "manual" ? (
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => onEdit(item)}>
                    <EditRoundedIcon />
                  </IconButton>

                  <IconButton onClick={() => onDelete(item)} color="error">
                    <DeleteRoundedIcon />
                  </IconButton>
                </Stack>
              ) : null}
            </Stack>
          </AppCard>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Origem</TableCell>
            <TableCell>Observações</TableCell>
            <TableCell>Valor considerado</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{formatDate(item.date)}</TableCell>

              <TableCell>{item.category}</TableCell>

              <TableCell>
                {item.source === "manual" ? (
                  <Chip size="small" label="Manual" />
                ) : (
                  <Chip size="small" label="Automático" color="info" />
                )}
              </TableCell>

              <TableCell>{item.notes || "-"}</TableCell>

              <TableCell>{renderValue(item)}</TableCell>

              <TableCell align="right">
                {item.source === "manual" ? (
                  <>
                    <IconButton onClick={() => onEdit(item)}>
                      <EditRoundedIcon />
                    </IconButton>

                    <IconButton onClick={() => onDelete(item)} color="error">
                      <DeleteRoundedIcon />
                    </IconButton>
                  </>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}