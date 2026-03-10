import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";
import { formatCurrency } from "../../earnings/earnings.utils";
import type { AppMode } from "../../../types/database";

type Props = {
  data: Array<{ date: string; value: number }>;
  appMode?: AppMode;
};

export function EarningsByDayChart({
  data,
  appMode = "driver",
}: Props) {
  const isBasicMode = appMode === "basic";

  return (
    <AppCard sx={{ height: 360, minWidth: 0 }}>
      <Typography variant="h6" gutterBottom>
        {isBasicMode ? "Entradas por dia" : "Ganhos por dia"}
      </Typography>

      <Box sx={{ width: "100%", height: 280, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </AppCard>
  );
}