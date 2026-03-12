/* eslint-disable no-console */

const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.");
  process.exit(1);
}

const DEFAULT_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const seedUsers = [
  {
    email: "admin@motoristaparc.local",
    password: "Admin123456!",
    name: "Administrador MotoristaParceiro",
    phone: "11999990001",
    app_mode: "driver",
    wallet_enabled: true,
    wallet_balance: 5000,
    is_admin: true,
    is_blocked: false,
    premium: true,
    premium_until: "2099-12-31T23:59:59.000Z",
  },
  {
    email: "driver.free@motoristaparc.local",
    password: "Driver123456!",
    name: "Carlos Motorista Free",
    phone: "11999990002",
    app_mode: "driver",
    wallet_enabled: true,
    wallet_balance: 850,
    is_admin: false,
    is_blocked: false,
    premium: false,
    premium_until: null,
  },
  {
    email: "driver.premium@motoristaparc.local",
    password: "DriverPremium123!",
    name: "Marcos Motorista Premium",
    phone: "11999990003",
    app_mode: "driver",
    wallet_enabled: true,
    wallet_balance: 2200,
    is_admin: false,
    is_blocked: false,
    premium: true,
    premium_until: "2099-12-31T23:59:59.000Z",
  },
  {
    email: "basic.free@motoristaparc.local",
    password: "Basic123456!",
    name: "Ana Controle Free",
    phone: "11999990004",
    app_mode: "basic",
    wallet_enabled: true,
    wallet_balance: 1400,
    is_admin: false,
    is_blocked: false,
    premium: false,
    premium_until: null,
  },
  {
    email: "basic.premium@motoristaparc.local",
    password: "BasicPremium123!",
    name: "Julia Controle Premium",
    phone: "11999990005",
    app_mode: "basic",
    wallet_enabled: true,
    wallet_balance: 3200,
    is_admin: false,
    is_blocked: false,
    premium: true,
    premium_until: "2099-12-31T23:59:59.000Z",
  },
  {
    email: "blocked@motoristaparc.local",
    password: "Blocked123456!",
    name: "Conta Bloqueada",
    phone: "11999990006",
    app_mode: "driver",
    wallet_enabled: false,
    wallet_balance: 0,
    is_admin: false,
    is_blocked: true,
    premium: false,
    premium_until: null,
  },
];

function logStep(message) {
  console.log(`\n➡️ ${message}`);
}

function logOk(message) {
  console.log(`✅ ${message}`);
}

function logWarn(message) {
  console.warn(`⚠️ ${message}`);
}

function makeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`${response.status} ${response.statusText} -> ${detail}`);
  }

  return data;
}

async function requestSafe(path, options = {}, fallback = null) {
  try {
    return await request(path, options);
  } catch (error) {
    logWarn(`${options.method || "GET"} ${path} falhou: ${error.message}`);
    return fallback;
  }
}

async function listAuthUsers() {
  const data = await request("/auth/v1/admin/users?page=1&per_page=1000");
  return Array.isArray(data?.users) ? data.users : [];
}

async function deleteSeededUsersIfExists() {
  const existing = await listAuthUsers();
  const targetEmails = new Set(seedUsers.map((u) => u.email));
  const usersToDelete = existing.filter((user) => targetEmails.has(user.email));

  if (!usersToDelete.length) {
    logOk("Nenhum usuário seed antigo encontrado.");
    return;
  }

  for (const user of usersToDelete) {
    console.log(`🧹 Limpando dados de ${user.email}...`);

    await requestSafe(`/rest/v1/user_subscriptions?user_id=eq.${user.id}`, {
      method: "DELETE",
    });

    await requestSafe(`/rest/v1/expenses?user_id=eq.${user.id}`, {
      method: "DELETE",
    });

    await requestSafe(`/rest/v1/earnings?user_id=eq.${user.id}`, {
      method: "DELETE",
    });

    await requestSafe(`/rest/v1/profiles?id=eq.${user.id}`, {
      method: "DELETE",
    });

    await requestSafe(`/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
    });
  }

  logOk(`${usersToDelete.length} usuário(s) seed antigo(s) removido(s).`);
}

async function createAuthUser(user) {
  const payload = {
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      name: user.name,
      phone: user.phone,
      app_mode: user.app_mode,
      wallet_enabled: user.wallet_enabled,
      wallet_balance: user.wallet_balance,
    },
  };

  const created = await request("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const authUser = created?.user ?? created;

  if (!authUser?.id) {
    console.error("Resposta inesperada ao criar usuário:", created);
    throw new Error(`Falha ao criar auth user para ${user.email}: resposta sem id.`);
  }

  return authUser;
}

async function updateProfile(userId, user) {
  await request(`/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: user.name,
      phone: user.phone,
      premium: user.premium,
      premium_forever: false,
      premium_until: user.premium_until,
      is_admin: user.is_admin,
      is_blocked: user.is_blocked,
      app_mode: user.app_mode,
      wallet_enabled: user.wallet_enabled,
      wallet_balance: user.wallet_balance,
    }),
  });
}

async function upsertAppSettings() {
  const rows = [
    {
      key: "subscription_mode",
      value: {
        enabled: true,
      },
    },
    {
      key: "maintenance_mode",
      value: {
        enabled: false,
        message: "",
      },
    },
    {
      key: "premium_pricing",
      value: {
        monthly_price: 19.9,
        quarterly_price: 49.9,
        semiannual_price: 89.9,
        annual_price: 149.9,
        stripe_price_monthly: "price_test_monthly_001",
        stripe_price_quarterly: "price_test_quarterly_001",
        stripe_price_semiannual: "price_test_semiannual_001",
        stripe_price_annual: "price_test_annual_001",
      },
    },
    {
      key: "new_user_premium_policy",
      value: {
        enabled: true,
        duration_days: 30,
      },
    },
  ];

  await request("/rest/v1/app_settings", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

function buildDriverPremiumEarnings(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(1),
      vehicle_type: "car",
      gross_amount: 380,
      km_traveled: 160,
      fuel_efficiency: 11,
      fuel_price: 6.2,
      auto_fuel_enabled: true,
      platform: "Uber",
      work_hours: 9,
      trips_count: 18,
      notes: "Turno forte de sexta",
    },
    {
      user_id: userId,
      date: makeDate(2),
      vehicle_type: "car",
      gross_amount: 290,
      km_traveled: 118,
      fuel_efficiency: 11,
      fuel_price: 6.1,
      auto_fuel_enabled: true,
      platform: "99",
      work_hours: 7.5,
      trips_count: 14,
      notes: "Boa taxa de aproveitamento",
    },
    {
      user_id: userId,
      date: makeDate(4),
      vehicle_type: "car",
      gross_amount: 410,
      km_traveled: 172,
      fuel_efficiency: 10.8,
      fuel_price: 6.15,
      auto_fuel_enabled: true,
      platform: "Uber",
      work_hours: 10,
      trips_count: 20,
      notes: "Dia premium de teste",
    },
  ];
}

function buildDriverFreeEarnings(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(1),
      vehicle_type: "car",
      gross_amount: 210,
      km_traveled: 95,
      fuel_efficiency: 10.5,
      fuel_price: 6.1,
      auto_fuel_enabled: false,
      platform: "Uber",
      work_hours: 5.5,
      trips_count: 10,
      notes: "Conta free",
    },
    {
      user_id: userId,
      date: makeDate(3),
      vehicle_type: "car",
      gross_amount: 180,
      km_traveled: 80,
      fuel_efficiency: 10.5,
      fuel_price: 6.1,
      auto_fuel_enabled: false,
      platform: "99",
      work_hours: 5,
      trips_count: 9,
      notes: "Conta free",
    },
  ];
}

function buildBasicEarnings(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(1),
      vehicle_type: "car",
      gross_amount: 1200,
      km_traveled: null,
      fuel_efficiency: null,
      fuel_price: null,
      auto_fuel_enabled: false,
      platform: null,
      work_hours: null,
      trips_count: null,
      notes: "Pagamento de cliente",
    },
    {
      user_id: userId,
      date: makeDate(6),
      vehicle_type: "car",
      gross_amount: 850,
      km_traveled: null,
      fuel_efficiency: null,
      fuel_price: null,
      auto_fuel_enabled: false,
      platform: null,
      work_hours: null,
      trips_count: null,
      notes: "Entrada complementar",
    },
  ];
}

function buildDriverPremiumExpenses(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(1),
      category: "Combustível",
      amount: 150,
      compensate_automatic_fuel: true,
      notes: "Abastecimento com compensação",
    },
    {
      user_id: userId,
      date: makeDate(2),
      category: "Alimentação",
      amount: 38,
      compensate_automatic_fuel: false,
      notes: "Refeição",
    },
    {
      user_id: userId,
      date: makeDate(3),
      category: "Lavagem",
      amount: 30,
      compensate_automatic_fuel: false,
      notes: "Lavagem rápida",
    },
  ];
}

function buildDriverFreeExpenses(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(1),
      category: "Combustível",
      amount: 90,
      compensate_automatic_fuel: false,
      notes: "Abastecimento free",
    },
    {
      user_id: userId,
      date: makeDate(4),
      category: "Manutenção",
      amount: 45,
      compensate_automatic_fuel: false,
      notes: "Troca simples",
    },
  ];
}

function buildBasicExpenses(userId) {
  return [
    {
      user_id: userId,
      date: makeDate(2),
      category: "Internet/Telefone",
      amount: 120,
      compensate_automatic_fuel: false,
      notes: "Plano mensal",
    },
    {
      user_id: userId,
      date: makeDate(5),
      category: "Outros",
      amount: 260,
      compensate_automatic_fuel: false,
      notes: "Compra operacional",
    },
  ];
}

async function insertRows(table, rows) {
  if (!rows.length) {
    logWarn(`Nenhuma linha para inserir em ${table}.`);
    return;
  }

  await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

async function seedSubscription(userId, planCode) {
  await insertRows("user_subscriptions", [
    {
      user_id: userId,
      provider: "stripe",
      provider_customer_id: `cus_${userId.slice(0, 8)}`,
      provider_subscription_id: `sub_${userId.slice(0, 8)}`,
      plan_code: planCode,
      status: "active",
      amount: 19.9,
      currency: "BRL",
      started_at: new Date().toISOString(),
      expires_at: "2099-12-31T23:59:59.000Z",
      canceled_at: null,
      is_auto_renew: true,
    },
  ]);
}

function resolveCreatedUsers(createdUsers) {
  const admin = createdUsers.find((u) => u.email === "admin@motoristaparc.local");
  const driverFree = createdUsers.find((u) => u.email === "driver.free@motoristaparc.local");
  const driverPremium = createdUsers.find((u) => u.email === "driver.premium@motoristaparc.local");
  const basicFree = createdUsers.find((u) => u.email === "basic.free@motoristaparc.local");
  const basicPremium = createdUsers.find((u) => u.email === "basic.premium@motoristaparc.local");
  const blocked = createdUsers.find((u) => u.email === "blocked@motoristaparc.local");

  if (!admin || !driverFree || !driverPremium || !basicFree || !basicPremium || !blocked) {
    throw new Error("Falha ao resolver usuários seed após criação.");
  }

  return {
    admin,
    driverFree,
    driverPremium,
    basicFree,
    basicPremium,
    blocked,
  };
}

function printSummary(createdUsers) {
  console.log("\n🎉 Ambiente de teste criado com sucesso.\n");
  console.log("=== CREDENCIAIS DE TESTE ===");
  for (const user of createdUsers) {
    console.log(`- ${user.email} | senha: ${user.password} | modo: ${user.app_mode}`);
  }
  console.log("============================\n");
}

async function main() {
  logStep("Limpando usuários seed antigos");
  await deleteSeededUsersIfExists();

  logStep("Aplicando app settings");
  await upsertAppSettings();
  logOk("App settings aplicadas.");

  const createdUsers = [];

  logStep("Criando usuários");
  for (const user of seedUsers) {
    console.log(`👤 Criando ${user.email}...`);

    const authUser = await createAuthUser(user);

    if (!authUser?.id) {
      throw new Error(`Usuário ${user.email} foi criado sem id retornado.`);
    }

    await updateProfile(authUser.id, user);
    createdUsers.push({ ...user, id: authUser.id });
  }
  logOk(`${createdUsers.length} usuário(s) criado(s).`);

  const { driverFree, driverPremium, basicFree, basicPremium } = resolveCreatedUsers(createdUsers);

  logStep("Inserindo ganhos");
  await insertRows("earnings", [
    ...buildDriverPremiumEarnings(driverPremium.id),
    ...buildDriverFreeEarnings(driverFree.id),
    ...buildBasicEarnings(basicFree.id),
    ...buildBasicEarnings(basicPremium.id),
  ]);
  logOk("Ganhos inseridos.");

  logStep("Inserindo gastos");
  await insertRows("expenses", [
    ...buildDriverPremiumExpenses(driverPremium.id),
    ...buildDriverFreeExpenses(driverFree.id),
    ...buildBasicExpenses(basicFree.id),
    ...buildBasicExpenses(basicPremium.id),
  ]);
  logOk("Gastos inseridos.");

  logStep("Inserindo assinaturas");
  await seedSubscription(driverPremium.id, "premium_monthly");
  await seedSubscription(basicPremium.id, "premium_annual");
  logOk("Assinaturas inseridas.");

  printSummary(createdUsers);
}

main().catch((error) => {
  console.error("\n❌ Erro ao montar ambiente de testes:");
  console.error(error);
  process.exit(1);
});