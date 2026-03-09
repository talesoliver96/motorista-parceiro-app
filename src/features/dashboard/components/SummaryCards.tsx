import { Grid, Stack, Typography } from "@mui/material";
import { AppCard } from "../../../components/common/AppCard";

type CardItem = {
  label: string;
  value: string;
};

const items: CardItem[] = [
  { label: "Ganho bruto", value: "R$ 0,00" },
  { label: "Gastos", value: "R$ 0,00" },
  { label: "Líquido", value: "R$ 0,00" },
  { label: "KM total", value: "-" },
];

// Cards iniciais do dashboard.
// Depois vamos alimentar com dados reais do banco.
export function SummaryCards() {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <AppCard>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6">{item.value}</Typography>
            </Stack>
          </AppCard>
        </Grid>
      ))}
    </Grid>
  );
}