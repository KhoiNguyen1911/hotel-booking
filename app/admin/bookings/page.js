import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import StatusBadge from "@/components/StatusBadge";
import { BookingActions } from "@/components/AdminClient";
import { listBookings, STATUSES, nightsBetween } from "@/lib/db";
import { vnd, dateVN, STATUS_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đặt phòng — Aurelia Admin" };

export default async function AdminBookings({ searchParams }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && STATUSES.includes(sp.status) ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const bookings = await listBookings({ status, q });

  const tab = (value, label) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    if (q) params.set("q", q);
    const active = status === value;
    return (
      <Link
        key={value}
        href={`/admin/bookings${params.toString() ? `?${params}` : ""}`}
        className={`whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-[0.14em] ${active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <AdminShell active="/admin/bookings" title="Đặt phòng" subtitle={`${bookings.length} đơn`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tab("all", "Tất cả")}
          {STATUSES.map((s) => tab(s, STATUS_LABEL[s]))}
        </div>
        <form className="flex gap-2" action="/admin/bookings">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Tìm mã, tên, email, phòng…" className="field !w-64" />
          <button className="btn btn-dark">Tìm</button>
        </form>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="tbl">
          <thead>
            <tr>
              <th>Mã</th><th>Khách</th><th>Phòng</th><th>Lưu trú</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-muted">Không có đơn đặt phòng phù hợp.</td></tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="font-medium">{b.code}</td>
                <td>
                  <div>{b.guest_name}</div>
                  <div className="text-xs text-muted">{b.guest_email}</div>
                </td>
                <td>
                  <div>{b.room_number}</div>
                  <div className="text-xs text-muted">{b.type_name}</div>
                </td>
                <td className="whitespace-nowrap">
                  {dateVN(b.check_in)} → {dateVN(b.check_out)}
                  <div className="text-xs text-muted">{nightsBetween(b.check_in, b.check_out)} đêm</div>
                </td>
                <td>{b.adults}{b.children ? `+${b.children}` : ""}</td>
                <td className="whitespace-nowrap">{vnd(b.total)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td><BookingActions id={b.id} status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
