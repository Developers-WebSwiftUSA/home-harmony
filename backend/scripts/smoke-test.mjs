const BASE = "http://localhost:5000/api";

const results = [];
const pass = (name) => results.push({ name, ok: true });
const fail = (name, detail) => results.push({ name, ok: false, detail });

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function login(email, password) {
  const { status, json } = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (status !== 200 || !json?.data?.token) {
    throw new Error(`Login failed for ${email}: ${json?.message || status}`);
  }
  return json.data.token;
}

async function main() {
  // Public
  for (const path of [
    "/properties?limit=3",
    "/properties?listingType=rent&limit=3",
    "/properties?listingType=sale&limit=3",
  ]) {
    const { status, json } = await request(path);
    if (status === 200 && json.success) pass(`GET ${path}`);
    else fail(`GET ${path}`, `${status} ${json.message || ""}`);
  }

  let adminToken;
  try {
    adminToken = await login("superadmin@gmail.com", "admin321");
    pass("Admin login");
  } catch (e) {
    fail("Admin login", e.message);
    printResults();
    process.exit(1);
  }

  const adminChecks = [
    ["/crm/partners?role=seller", "CRM sellers"],
    ["/crm/partners?role=agent", "CRM agents"],
    ["/messages/conversations", "Admin conversations"],
    ["/analytics/admin", "Admin analytics"],
    ["/tours?limit=5", "Admin tours"],
  ];

  for (const [path, name] of adminChecks) {
    const { status, json } = await request(path, { token: adminToken });
    if (status === 200 && json.success !== false) pass(name);
    else fail(name, `${status} ${json.message || ""}`);
  }

  const partners = await request("/crm/partners?role=seller", { token: adminToken });
  const partner = partners.json?.data?.[0]?.partner;
  if (partner?._id) {
    const detail = await request(`/crm/partners/${partner._id}`, { token: adminToken });
    if (detail.status === 200) pass("CRM partner detail");
    else fail("CRM partner detail", detail.json?.message);

    const conv = await request(`/messages/conversations/${partner._id}`, { token: adminToken });
    if (conv.status === 200 && conv.json?.data?._id) pass("Admin message partner");
    else fail("Admin message partner", conv.json?.message);
  } else {
    fail("CRM partner detail", "No sellers in DB");
  }

  // Find other role users via properties/tours or try common patterns
  const properties = await request("/properties?limit=20", { token: adminToken });
  const list = properties.json?.data || [];

  printResults();
}

function printResults() {
  const failed = results.filter((r) => !r.ok);
  console.log("\n=== Smoke Test Results ===");
  for (const r of results) {
    console.log(r.ok ? "✓" : "✗", r.name, r.detail ? `- ${r.detail}` : "");
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
