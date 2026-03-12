import {
  Button,
  Collapse,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMemo, useState } from "react";
import type { AdvancedMovementFilters } from "../../utils/movementFilters";

type Props = {
  title?: string;
  categoryLabel?: string;
  categoryOptions?: string[];
  value: AdvancedMovementFilters;
  onChange: (next: AdvancedMovementFilters) => void;
};

export function AdvancedMovementFilters({
  title = "Filtros avançados",
  categoryLabel = "Categoria / origem",
  categoryOptions = [],
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      value.search ||
        value.category ||
        value.notes ||
        value.exactDay ||
        value.exactMonth ||
        value.exactYear
    );
  }, [value]);

  const handleField =
    (field: keyof AdvancedMovementFilters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  const handleReset = () => {
    onChange({
      search: "",
      category: "",
      notes: "",
      exactDay: "",
      exactMonth: "",
      exactYear: "",
    });
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterAltRoundedIcon color="action" />
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant={open ? "contained" : "outlined"}
            onClick={() => setOpen((prev) => !prev)}
            startIcon={<SearchRoundedIcon />}
          >
            {open ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>

          <Button
            variant="text"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            startIcon={<RestartAltRoundedIcon />}
          >
            Limpar
          </Button>
        </Stack>
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Busca"
              placeholder="Digite categoria, origem, observação, valor..."
              value={value.search}
              onChange={handleField("search")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label={categoryLabel}
              value={value.category}
              onChange={handleField("category")}
            >
              <MenuItem value="">Todas</MenuItem>

              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Observação"
              placeholder="Filtrar por observações"
              value={value.notes}
              onChange={handleField("notes")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Dia exato"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={value.exactDay}
              onChange={handleField("exactDay")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Mês"
              type="month"
              InputLabelProps={{ shrink: true }}
              value={value.exactMonth}
              onChange={handleField("exactMonth")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Ano"
              type="number"
              inputProps={{ min: 2000, max: 2100, step: 1 }}
              value={value.exactYear}
              onChange={handleField("exactYear")}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Stack>
  );
}