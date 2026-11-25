import { createBooking } from "@/lib/db";

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
  const requests = String(body.requests || "").trim().slice(0, 300);
  const adults = Number(body.adults);
  const children = Number(body.children || 0);

  if (name.length < 2 || name.length > 80) return Response.json({ error: "Vui lòng nhập họ tên hợp lệ." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Email không hợp lệ." }, { status: 400 });
  if (!PHONE_RE.test(phone)) return Response.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 1 || children < 0) {
    return Response.json({ error: "Số khách không hợp lệ." }, { status: 400 });
  }

  try {
    const code = await createBooking({
      typeSlug: String(body.typeSlug || ""),
      checkIn: String(body.checkIn || ""),
      checkOut: String(body.checkOut || ""),
      adults,
      children,
      name,
      email,
      phone,
      requests,
    });
    return Response.json({ code }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || "Không thể đặt phòng." }, { status: 409 });
  }
}
