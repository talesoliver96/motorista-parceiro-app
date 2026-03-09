// Tipos globais simples do app.
// Vamos expandir depois conforme as telas forem entrando.

export type ThemeMode = "light" | "dark";

export type VehicleType = "car" | "motorcycle" | "bicycle";

export type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};