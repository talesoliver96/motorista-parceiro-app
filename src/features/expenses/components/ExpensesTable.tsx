import {
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
import type { Expense } from "../../../types/database";
import { formatCurrency, formatDate } from "../../earnings/earnings.utils";
import { EmptyState } from "../../../components/common/EmptyState";
import { AppCard } from "../../../components/common/AppCard";

type Props = {
  items: Expense[];
  onEdit: (item: Expense) => void;
  onDelete: (item: Expense) => void;
};

export function ExpensesTable({ items, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!items.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <EmptyState
          title="Nenhum gasto encontrado"
          description="Cadastre seus gastos para acompanhar o lucro líquido."
        />
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {items.map((item) => (
          <AppCard key={item.id}>
            <Stack spacing={1.2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(item.amount)}
                </Typography>

                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onEdit(item)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(item)}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {formatDate(item.date)}
              </Typography>

              <Typography variant="body2">
                Categoria: {item.category}
              </Typography>

              {item.notes ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Observações
                  </Typography>
                  <Typography variant="body2">{item.notes}</Typography>
                </Box>
              ) : null}
            </Stack>
          </AppCard>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 680 }}>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Observações</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ maxWidth: 220 }}
                  title={item.notes ?? ""}
                >
                  {item.notes || "-"}
                </Typography>
              </TableCell>
              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton onClick={() => onEdit(item)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(item)}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}