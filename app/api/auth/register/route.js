import { cookies } from "next/headers";
import { createUser } from "@/lib/db";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+ ]{8,15}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");

  if (name.length < 2 || name.length > 80) return Response.json({ error: "Vui lòng nhập họ tên hợp lệ." }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 120) return Response.json({ error: "Email không hợp lệ." }, { status: 400 });
  if (phone && !PHONE_RE.test(phone)) return Response.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: "Mật khẩu phải có từ 8 đến 128 ký tự." }, { status: 400 });
  }

  try {
    const id = await createUser({ name, email, phone, password });
    const store = await cookies();
    store.set(SESSION_COOKIE, createSessionToken(id), sessionCookieOptions());
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || "Không thể đăng ký." }, { status: 409 });
  }
}
