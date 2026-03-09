import { Stack, TextField } from "@mui/material";

type Props = {
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
};

export function DashboardFilters({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        label="Data inicial"
        type="date"
        value={startDate}
        onChange={(e) => onChangeStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Data final"
        type="date"
        value={endDate}
        onChange={(e) => onChangeEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}