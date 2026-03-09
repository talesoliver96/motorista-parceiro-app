import { Card, CardContent, type CardProps } from "@mui/material";

type Props = CardProps & {
  children: React.ReactNode;
};

// Card padrão reutilizável.
// Mantém visual consistente no app inteiro.
export function AppCard({ children, ...props }: Props) {
  return (
    <Card {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}