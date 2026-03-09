import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { TextField, type TextFieldProps } from "@mui/material";

type Props = Omit<NumericFormatProps<TextFieldProps>, "customInput"> & {
  label: string;
  error?: boolean;
  helperText?: React.ReactNode;
};

// Campo padrão de moeda.
// Mostra R$ bonitinho para o usuário, mas entrega o valor numérico ao formulário.
export function CurrencyField({
  label,
  error,
  helperText,
  ...props
}: Props) {
  return (
    <NumericFormat
      customInput={TextField}
      label={label}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      error={error}
      helperText={helperText}
      {...props}
    />
  );
}