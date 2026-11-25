import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db";

export const SESSION_COOKIE = "aurelia_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  // A guessable fallback is fine on a dev machine but must never run on a public server.
  if (process.env.TURSO_DATABASE_URL || process.env.VERCEL || process.env.RENDER) {
    throw new Error("SESSION_SECRET is not set. Add a long random value to the hosting environment variables.");
  }
  return "aurelia-local-dev-secret";
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

/** Token format: <userId>.<expiryMs>.<hmac> */
export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  if (expected.length !== parts[2].length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]))) return null;
  if (!(Number(parts[1]) > Date.now())) return null;
  const id = Number(parts[0]);
  return Number.isInteger(id) ? id : null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

/** Current logged-in user (without password hash) or null. */
export async function getCurrentUser() {
  const store = await cookies();
  const id = readToken(store.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const u = await getUserById(id);
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role };
}

export async function isAdmin() {
  const u = await getCurrentUser();
  return !!u && u.role === "admin";
}

/** Redirects to /login unless a logged-in admin. Returns the user. */
export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) redirect("/login?next=/admin");
  if (u.role !== "admin") redirect("/account?denied=1");
  return u;
}

export async function requireUser(next = "/account") {
  const u = await getCurrentUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}
