import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StatusBadge from "@/components/StatusBadge";
import { LogoutButton } from "@/components/AdminClient";
import { requireUser } from "@/lib/auth";
import { listBookingsByEmail, nightsBetween } from "@/lib/db";
import { vnd, dateVN } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tài khoản — Aurelia Grand Hotel" };

export default async function AccountPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser("/account");
  const bookings = await listBookingsByEmail(user.email);

  return (
    <>
      <div className="relative bg-night pb-12 pt-32 text-white">
        <SiteHeader dark />
        <div className="mx-auto max-w-5xl px-6">
          <p className="eyebrow !text-gold">Tài khoản của tôi</p>
          <h1 className="mt-3 font-serif text-5xl">Xin chào, {user.name}</h1>
          <p className="mt-2 text-sm text-stone-400">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {sp.denied && (
          <p role="alert" className="mb-8 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Tài khoản này không có quyền truy cập khu vực quản trị.
          </p>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-3xl">Đặt phòng của tôi</h2>
          <div className="flex items-center gap-4">
            {user.role === "admin" && <Link href="/admin" className="btn btn-dark !py-2.5">Vào trang quản trị</Link>}
            <Link href="/rooms" className="btn btn-outline !py-2.5">Đặt phòng mới</Link>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="border border-line bg-paper p-10 text-center text-muted">
            Bạn chưa có đặt phòng nào với email này.
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id} className="border border-line bg-paper p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/booking/${b.code}`} className="font-serif text-2xl tracking-widest hover:text-gold">{b.code}</Link>
                    <p className="text-sm text-muted">{b.type_name} · phòng {b.room_number}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-sm">
                  <span>{dateVN(b.check_in)} → {dateVN(b.check_out)} · {nightsBetween(b.check_in, b.check_out)} đêm</span>
                  <span className="font-serif text-xl">{vnd(b.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 border-t border-line pt-6">
          <LogoutButton tone="dark" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
