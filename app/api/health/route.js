import { getDb, cleanToken } from "@/lib/db";

/** Calls Turso directly with a trivial query and reports only status + Turso's error text. */
async function probeTurso(statements) {
  const base = (process.env.TURSO_DATABASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/^libsql:\/\//i, "https://");
  const token = cleanToken(process.env.TURSO_AUTH_TOKEN);
  try {
    const res = await fetch(`${base}/v2/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ requests: [...statements.map((sql) => ({ type: "execute", stmt: { sql } })), { type: "close" }] }),
    });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 300) };
  } catch (e) {
    return { status: null, body: String(e?.message || e).slice(0, 200) };
  }
}

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
    const token = cleanToken(process.env.TURSO_AUTH_TOKEN) || "";
    return Response.json(
      {
        ...info,
        tokenLooksLikeJwt: /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(token),
        tokenLength: token.length,
        database: "error",
        errorCode: String(e?.code || e?.name || "unknown"),
        httpStatus: e?.cause?.status ?? null,
        // What Turso itself answers to two read-only queries (never writes anything):
        probeSelect1: await probeTurso(["SELECT 1"]),
        probeTables: await probeTurso(["SELECT name FROM sqlite_master WHERE type = 'table' LIMIT 20"]),
      },
      { status: 500 }
    );
  }
}
