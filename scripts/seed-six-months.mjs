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

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

async function insertInChunks(table, items, chunkSize = 100) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    const { error } = await supabase.from(table).insert(chunk);

    if (error) {
      console.error(`Erro ao inserir em ${table}:`, error);
      process.exit(1);
    }
  }
}

async function run() {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 6);

  const earnings = [];
  const expenses = [];

  const createdMonthlyEntries = new Set();

  let cursor = new Date(start);

  while (cursor <= today) {
    const date = formatDate(cursor);
    const monthKey = getMonthKey(cursor);

    // =========================
    // GANHO DIÁRIO
    // =========================
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

    // =========================
    // GASTO DIÁRIO - COMIDA
    // =========================
    expenses.push({
      user_id: TARGET_USER_ID,
      date,
      category: "Comida",
      amount: 20,
      notes: "Mock seed diário",
    });

    // =========================
    // GASTOS MENSAIS
    // cria apenas 1 vez por mês
    // =========================
    if (!createdMonthlyEntries.has(monthKey)) {
      createdMonthlyEntries.add(monthKey);

      const billingDate = new Date(cursor);
      billingDate.setDate(5);
      const billingDateString = formatDate(billingDate);

      expenses.push({
        user_id: TARGET_USER_ID,
        date: billingDateString,
        category: "Locação/Parcela",
        amount: 1700,
        notes: "Mock seed mensal",
      });

      expenses.push({
        user_id: TARGET_USER_ID,
        date: billingDateString,
        category: "Conta de luz",
        amount: 110,
        notes: "Mock seed mensal",
      });

      expenses.push({
        user_id: TARGET_USER_ID,
        date: billingDateString,
        category: "Conta de celular",
        amount: 50,
        notes: "Mock seed mensal",
      });
    }

    cursor = addDays(cursor, 1);
  }

  console.log(`Inserindo ${earnings.length} ganhos...`);
  await insertInChunks("earnings", earnings);

  console.log(`Inserindo ${expenses.length} gastos...`);
  await insertInChunks("expenses", expenses);

  console.log("Seed concluído com sucesso.");
}
run();