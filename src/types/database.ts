export type VehicleType = "car" | "motorcycle" | "bicycle";

export type AppMode = "driver" | "basic";

export type Profile = {
  id: string;
  name: string;
  phone: string | null;
  premium: boolean;
  premium_forever: boolean;
  premium_until: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  app_mode: AppMode;
  wallet_enabled: boolean;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
};

export type Earning = {
  id: string;
  user_id: string;
  date: string;
  vehicle_type: VehicleType;
  gross_amount: number;
  km_traveled: number | null;
  fuel_efficiency: number | null;
  fuel_price: number | null;
  auto_fuel_enabled: boolean;
  platform: string | null;
  work_hours: number | null;
  trips_count: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  category: string;
  amount: number;
  compensate_automatic_fuel: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminAction = {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};