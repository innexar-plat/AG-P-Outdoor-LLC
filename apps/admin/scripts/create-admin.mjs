/**
 * Creates the first admin user via Better Auth sign-up API.
 * Run inside Docker: node apps/admin/scripts/create-admin.mjs
 */
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function getSignUpUrl(base) {
  const normalized = base.replace(/\/+$/, "");
  if (normalized.endsWith("/admin")) {
    return `${normalized}/api/auth/sign-up/email`;
  }
  return `${normalized}/admin/api/auth/sign-up/email`;
}

async function main() {
  const res = await fetch(getSignUpUrl(BASE), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,
    },
    body: JSON.stringify({
      email: "admin@admin.com",
      password: "admin123456",
      name: "Admin",
    }),
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);

  if (!res.ok) {
    console.error("Sign-up failed. If user already exists, try signing in.");
    process.exit(1);
  }

  console.log("Admin user created successfully!");
  console.log("Credentials: admin@admin.com / admin123456");

  // Update role to admin
  const { createClient } = await import("@libsql/client");
  const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  await client.execute({
    sql: "UPDATE user SET role = 'admin' WHERE email = ?",
    args: ["admin@admin.com"],
  });
  console.log("Role updated to admin.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
