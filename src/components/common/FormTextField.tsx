import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { TextField, type TextFieldProps } from "@mui/material";

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<TextFieldProps, "name" | "defaultValue">;

export function FormTextField<T extends FieldValues>({
  name,
  control,
  ...props
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          fullWidth
          value={field.value ?? ""}
          error={!!fieldState.error}
          helperText={fieldState.error?.message || props.helperText}
        />
      )}
    />
  );
}