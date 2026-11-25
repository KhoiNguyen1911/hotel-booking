import { isAdmin } from "@/lib/auth";
import { updateRoomStatus } from "@/lib/db";

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const { id } = await params;
  const roomId = Number(id);
  if (!Number.isInteger(roomId)) return Response.json({ error: "Mã không hợp lệ." }, { status: 400 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  try {
    const ok = await updateRoomStatus(roomId, body.status);
    if (!ok) return Response.json({ error: "Không tìm thấy phòng." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
