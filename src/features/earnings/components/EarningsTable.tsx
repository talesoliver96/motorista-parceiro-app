import {
  Box,
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
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import type { Earning } from "../../../types/database";
import {
  formatCurrency,
  formatDate,
  getEarningPerHour,
  getEarningPerKm,
} from "../earnings.utils";
import { EmptyState } from "../../../components/common/EmptyState";
import { AppCard } from "../../../components/common/AppCard";

type Props = {
  items: Earning[];
  onEdit: (item: Earning) => void;
  onDelete: (item: Earning) => void;
  isPremium: boolean;
};

const vehicleTypeLabel: Record<string, string> = {
  car: "Carro",
  motorcycle: "Moto",
  bicycle: "Bicicleta",
};

export function EarningsTable({
  items,
  onEdit,
  onDelete,
  isPremium,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!items.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <EmptyState
          title="Nenhum ganho encontrado"
          description="Cadastre seu primeiro ganho para começar a acompanhar os resultados."
        />
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {items.map((item) => {
          const earningPerKm = getEarningPerKm(item);
          const earningPerHour = getEarningPerHour(item);

          return (
            <AppCard key={item.id}>
              <Stack spacing={1.2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {formatCurrency(item.gross_amount)}
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
                  {formatDate(item.date)} •{" "}
                  {vehicleTypeLabel[item.vehicle_type] || item.vehicle_type}
                </Typography>

                <Typography variant="body2">
                  Plataforma: {item.platform || "-"}
                </Typography>

                <Typography variant="body2">
                  KM: {item.km_traveled ?? "-"}
                </Typography>

                <Typography variant="body2">
                  R$/KM:{" "}
                  {isPremium ? (
                    earningPerKm ? formatCurrency(earningPerKm) : "-"
                  ) : (
                    <Chip
                      size="small"
                      icon={<LockRoundedIcon />}
                      label="Premium"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Typography>

                <Typography variant="body2">
                  Horas: {item.work_hours ?? "-"}
                </Typography>

                <Typography variant="body2">
                  R$/hora:{" "}
                  {isPremium ? (
                    earningPerHour ? formatCurrency(earningPerHour) : "-"
                  ) : (
                    <Chip
                      size="small"
                      icon={<LockRoundedIcon />}
                      label="Premium"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Typography>

                <Typography variant="body2">
                  Corridas: {item.trips_count ?? "-"}
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
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Veículo</TableCell>
            <TableCell>Plataforma</TableCell>
            <TableCell align="right">Ganho bruto</TableCell>
            <TableCell align="right">KM</TableCell>
            <TableCell align="right">R$/KM</TableCell>
            <TableCell align="right">Horas</TableCell>
            <TableCell align="right">R$/hora</TableCell>
            <TableCell align="right">Corridas</TableCell>
            <TableCell>Observações</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const earningPerKm = getEarningPerKm(item);
            const earningPerHour = getEarningPerHour(item);

            return (
              <TableRow key={item.id} hover>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>
                  {vehicleTypeLabel[item.vehicle_type] || item.vehicle_type}
                </TableCell>
                <TableCell>{item.platform || "-"}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.gross_amount)}
                </TableCell>
                <TableCell align="right">{item.km_traveled ?? "-"}</TableCell>
                <TableCell align="right">
                  {isPremium ? (
                    earningPerKm ? formatCurrency(earningPerKm) : "-"
                  ) : (
                    <Chip
                      size="small"
                      icon={<LockRoundedIcon />}
                      label="Premium"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">{item.work_hours ?? "-"}</TableCell>
                <TableCell align="right">
                  {isPremium ? (
                    earningPerHour ? formatCurrency(earningPerHour) : "-"
                  ) : (
                    <Chip
                      size="small"
                      icon={<LockRoundedIcon />}
                      label="Premium"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">{item.trips_count ?? "-"}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ maxWidth: 180 }}
                    title={item.notes ?? ""}
                  >
                    {item.notes || "-"}
                  </Typography>
                </TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}