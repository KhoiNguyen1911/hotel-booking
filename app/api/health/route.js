import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Diagnostics only. Reports whether configuration is present and whether the database
 * answers. It never prints the database URL, token, secret or password.
 */
export async function GET() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || "").trim();
  let host = "";
  try {
    host = new URL(rawUrl.replace(/^libsql:\/\//i, "https://")).hostname;
  } catch {
    host = "";
  }
  const info = {
    hasDatabaseUrl: !!rawUrl,
    urlScheme: rawUrl.includes("://") ? rawUrl.split("://")[0] : null,
    hostLooksLikeTurso: host.endsWith(".turso.io"),
    hasAuthToken: !!(process.env.TURSO_AUTH_TOKEN || "").trim(),
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
  };

  try {
    const c = await getDb();
    await c.execute("SELECT 1");
    const admins = await c.execute("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
    return Response.json({ ...info, database: "ok", adminAccounts: Number(admins.rows[0].n) });
  } catch (e) {
    return Response.json(
      { ...info, database: "error", errorCode: String(e?.code || e?.name || "unknown"), httpStatus: e?.cause?.status ?? null },
      { status: 500 }
    );
  }
}
