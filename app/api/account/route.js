import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateUserProfile } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+ ]{8,15}$/;

// Failed "current password" attempts per user: 6 per 10 minutes (per server instance).
const FAILS = globalThis.__accountFails || (globalThis.__accountFails = new Map());
const WINDOW = 10 * 60 * 1000;
const MAX_FAILS = 6;

export async function PATCH(request) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Bạn cần đăng nhập." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const now = Date.now();
  const recent = (FAILS.get(session.id) || []).filter((t) => now - t < WINDOW);
  FAILS.set(session.id, recent);
  if (recent.length >= MAX_FAILS) {
    return Response.json({ error: "Nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 10 phút." }, { status: 429 });
  }

  // Every change requires the current password.
  const user = await getUserById(session.id);
  if (!user || !verifyPassword(String(body.currentPassword || ""), user.password_hash)) {
    recent.push(now);
    return Response.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 403 });
  }

  const changes = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 80) return Response.json({ error: "Họ tên phải từ 2 đến 80 ký tự." }, { status: 400 });
    if (name !== user.name) changes.name = name;
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 120) return Response.json({ error: "Email không hợp lệ." }, { status: 400 });
    if (email !== user.email) changes.email = email;
  }
  if (body.phone !== undefined) {
    const phone = String(body.phone).trim();
    if (phone && !PHONE_RE.test(phone)) return Response.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
    if (phone !== user.phone) changes.phone = phone;
  }
  if (body.newPassword) {
    const pw = String(body.newPassword);
    const min = user.role === "admin" ? 10 : 8;
    if (pw.length < min || pw.length > 128) {
      return Response.json({ error: `Mật khẩu mới phải có từ ${min} đến 128 ký tự.` }, { status: 400 });
    }
    if (String(body.confirmPassword || "") !== pw) {
      return Response.json({ error: "Mật khẩu xác nhận không khớp." }, { status: 400 });
    }
    changes.newPassword = pw;
  }

  if (Object.keys(changes).length === 0) {
    return Response.json({ error: "Bạn chưa thay đổi thông tin nào." }, { status: 400 });
  }

  try {
    await updateUserProfile(user.id, changes);
    FAILS.delete(session.id);
    return Response.json({ ok: true, changed: Object.keys(changes).map((k) => (k === "newPassword" ? "password" : k)) });
  } catch (e) {
    return Response.json({ error: e.message || "Không thể cập nhật." }, { status: 409 });
  }
}
