import { Button, Stack, TextField } from "@mui/material";

type Props = {
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  onClickAdd: () => void;
};

export function ExpensesToolbar({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onClickAdd,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      justifyContent="space-between"
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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

      <Button variant="contained" onClick={onClickAdd}>
        Adicionar gasto
      </Button>
    </Stack>
  );
}