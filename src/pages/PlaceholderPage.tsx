import { Stack, Typography } from "@mui/material";
import { PageContainer } from "../components/common/PageContainer";

type Props = {
  title: string;
};

export function PlaceholderPage({ title }: Props) {
  return (
    <PageContainer>
      <Stack spacing={1}>
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary">
          Esta tela será implementada nas próximas etapas.
        </Typography>
      </Stack>
    </PageContainer>
  );
}