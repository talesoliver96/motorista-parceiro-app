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
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import { AppCard } from "../../../components/common/AppCard";
import { EmptyState } from "../../../components/common/EmptyState";
import type { AppMode, Earning } from "../../../types/database";
import {
  formatCurrency,
  formatDate,
  getAutomaticFuelCost,
  getEarningPerHour,
  getEarningPerKm,
} from "../earnings.utils";

type Props = {
  items: Earning[];
  isPremium: boolean;
  appMode: AppMode;
  netByEarningId?: Record<string, number>;
  onEdit: (item: Earning) => void;
  onDelete: (item: Earning) => void;
};

function getVehicleLabel(vehicleType: Earning["vehicle_type"]) {
  switch (vehicleType) {
    case "car":
      return "Carro";
    case "motorcycle":
      return "Moto";
    case "bicycle":
      return "Bicicleta";
    default:
      return vehicleType;
  }
}

export function EarningsTable({
  items,
  isPremium,
  appMode,
  netByEarningId = {},
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDriverMode = appMode === "driver";

  if (!items.length) {
    return (
      <EmptyState
        title={isDriverMode ? "Nenhum ganho encontrado" : "Nenhuma entrada encontrada"}
        description={
          isDriverMode
            ? "Cadastre seus ganhos para acompanhar seu resultado financeiro."
            : "Cadastre suas entradas para acompanhar seu resultado financeiro."
        }
      />
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {items.map((item) => {
          const earningPerKm = getEarningPerKm(item);
          const earningPerHour = getEarningPerHour(item);
          const automaticFuel = getAutomaticFuelCost(item);
          const net = Number(netByEarningId[item.id] ?? item.gross_amount ?? 0);

          return (
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
                      {isDriverMode ? item.platform || "Ganho" : "Entrada"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.date)}
                    </Typography>
                  </Box>

                  {isDriverMode ? (
                    <Chip
                      size="small"
                      label={getVehicleLabel(item.vehicle_type)}
                      color="primary"
                    />
                  ) : (
                    <Chip size="small" label="Financeiro" color="primary" />
                  )}
                </Stack>

                <Typography variant="h6">
                  {formatCurrency(item.gross_amount)}
                </Typography>

                <Typography
                  variant="body2"
                  color={net >= 0 ? "success.main" : "error.main"}
                >
                  {isDriverMode ? "Líquido estimado" : "Entrada líquida estimada"}:{" "}
                  {formatCurrency(net)}
                </Typography>

                {isDriverMode ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {item.auto_fuel_enabled ? (
                      <Chip
                        size="small"
                        color="success"
                        label="Combustível automático ativo"
                      />
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Sem combustível automático"
                      />
                    )}
                  </Stack>
                ) : null}

                <Stack spacing={0.5}>
                  {isDriverMode && item.km_traveled ? (
                    <Typography variant="body2" color="text.secondary">
                      KM: {item.km_traveled}
                    </Typography>
                  ) : null}

                  {isDriverMode && item.work_hours ? (
                    <Typography variant="body2" color="text.secondary">
                      Horas: {item.work_hours}
                    </Typography>
                  ) : null}

                  {isDriverMode && item.trips_count ? (
                    <Typography variant="body2" color="text.secondary">
                      Corridas: {item.trips_count}
                    </Typography>
                  ) : null}

                  {isDriverMode && isPremium && earningPerKm !== null ? (
                    <Typography variant="body2" color="text.secondary">
                      Ganho/KM: {formatCurrency(earningPerKm)}
                    </Typography>
                  ) : null}

                  {isDriverMode && earningPerHour !== null ? (
                    <Typography variant="body2" color="text.secondary">
                      Ganho/hora: {formatCurrency(earningPerHour)}
                    </Typography>
                  ) : null}

                  {isDriverMode && isPremium && item.auto_fuel_enabled ? (
                    <Typography variant="body2" color="text.secondary">
                      Combustível estimado:{" "}
                      {automaticFuel !== null
                        ? formatCurrency(automaticFuel)
                        : "Preencha KM, consumo e preço"}
                    </Typography>
                  ) : null}
                </Stack>

                {item.notes ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Observações
                    </Typography>

                    <Typography variant="body2">{item.notes}</Typography>
                  </Box>
                ) : null}

                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => onEdit(item)}>
                    <EditRoundedIcon />
                  </IconButton>

                  <IconButton onClick={() => onDelete(item)} color="error">
                    <DeleteRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </AppCard>
          );
        })}
      </Stack>
    );
  }

  if (!isDriverMode) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Bruto</TableCell>
              <TableCell>Líquido estimado</TableCell>
              <TableCell>Observações</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => {
              const net = Number(netByEarningId[item.id] ?? item.gross_amount ?? 0);

              return (
                <TableRow key={item.id} hover>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>Entrada</TableCell>
                  <TableCell>{formatCurrency(item.gross_amount)}</TableCell>
                  <TableCell sx={{ color: net >= 0 ? "success.main" : "error.main", fontWeight: 700 }}>
                    {formatCurrency(net)}
                  </TableCell>
                  <TableCell>{item.notes || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => onEdit(item)}>
                      <EditRoundedIcon />
                    </IconButton>

                    <IconButton onClick={() => onDelete(item)} color="error">
                      <DeleteRoundedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Plataforma</TableCell>
            <TableCell>Veículo</TableCell>
            <TableCell>Ganho bruto</TableCell>
            <TableCell>Ganho líquido</TableCell>
            <TableCell>KM</TableCell>
            <TableCell>Ganho/KM</TableCell>
            <TableCell>Combustível automático</TableCell>
            <TableCell>Combustível estimado</TableCell>
            <TableCell>Observações</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const earningPerKm = getEarningPerKm(item);
            const automaticFuel = getAutomaticFuelCost(item);
            const net = Number(netByEarningId[item.id] ?? item.gross_amount ?? 0);

            return (
              <TableRow key={item.id} hover>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.platform || "-"}</TableCell>
                <TableCell>{getVehicleLabel(item.vehicle_type)}</TableCell>
                <TableCell>{formatCurrency(item.gross_amount)}</TableCell>
                <TableCell sx={{ color: net >= 0 ? "success.main" : "error.main", fontWeight: 700 }}>
                  {formatCurrency(net)}
                </TableCell>
                <TableCell>{item.km_traveled ?? "-"}</TableCell>
                <TableCell>
                  {isPremium && earningPerKm !== null
                    ? formatCurrency(earningPerKm)
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.auto_fuel_enabled ? (
                    <Chip size="small" color="success" label="Ativo" />
                  ) : (
                    <Chip size="small" variant="outlined" label="Não" />
                  )}
                </TableCell>
                <TableCell>
                  {isPremium && item.auto_fuel_enabled
                    ? automaticFuel !== null
                      ? formatCurrency(automaticFuel)
                      : "Preencha KM, consumo e preço"
                    : "-"}
                </TableCell>
                <TableCell>{item.notes || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => onEdit(item)}>
                    <EditRoundedIcon />
                  </IconButton>

                  <IconButton onClick={() => onDelete(item)} color="error">
                    <DeleteRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}