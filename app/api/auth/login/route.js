import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

// Very small in-memory throttle: max 8 failed attempts per email per 10 minutes.
const FAILS = globalThis.__loginFails || (globalThis.__loginFails = new Map());
const WINDOW = 10 * 60 * 1000;
const MAX_FAILS = 8;

function tooMany(key) {
  const now = Date.now();
  const list = (FAILS.get(key) || []).filter((t) => now - t < WINDOW);
  FAILS.set(key, list);
  return list.length >= MAX_FAILS;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return Response.json({ error: "Vui lòng nhập email và mật khẩu." }, { status: 400 });

  if (tooMany(email)) {
    return Response.json({ error: "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút." }, { status: 429 });
  }

  const user = await getUserByEmail(email);
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const ok = verifyPassword(password, user?.password_hash || "scrypt$00$00") && !!user;
  if (!ok) {
    FAILS.get(email).push(Date.now());
    return Response.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  FAILS.delete(email);
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
  return Response.json({ ok: true, role: user.role });
}
