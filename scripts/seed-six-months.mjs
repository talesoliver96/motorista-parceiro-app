import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const TARGET_USER_ID = process.env.TARGET_USER_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TARGET_USER_ID) {
  console.error(
    "Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e TARGET_USER_ID nas envs."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function run() {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 6);

  const earnings = [];
  let cursor = new Date(start);

  while (cursor <= today) {
    const date = formatDate(cursor);

    earnings.push({
      user_id: TARGET_USER_ID,
      date,
      vehicle_type: "car",
      gross_amount: 300,
      km_traveled: 150,
      fuel_efficiency: 11,
      fuel_price: 6,
      platform: "99",
      work_hours: 10,
      trips_count: 20,
      notes: "Mock seed de 6 meses",
    });

    cursor = addDays(cursor, 1);
  }

  console.log(`Inserindo ${earnings.length} ganhos...`);

  const chunkSize = 100;

  for (let i = 0; i < earnings.length; i += chunkSize) {
    const chunk = earnings.slice(i, i + chunkSize);

    const { error } = await supabase.from("earnings").insert(chunk);

    if (error) {
      console.error("Erro ao inserir chunk:", error);
      process.exit(1);
    }
  }

  console.log("Seed concluído com sucesso.");
}

run();