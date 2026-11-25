import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StatusBadge from "@/components/StatusBadge";
import { getBookingByCode, nightsBetween } from "@/lib/db";
import { vnd, dateVN } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Xác nhận đặt phòng — Aurelia Grand Hotel" };

export default async function BookingConfirmation({ params }) {
  const { code } = await params;
  const b = await getBookingByCode(code);
  if (!b) notFound();

  const nights = nightsBetween(b.check_in, b.check_out);
  const rows = [
    ["Hạng phòng", b.type_name],
    ["Nhận phòng", `${dateVN(b.check_in)} · từ 14:00`],
    ["Trả phòng", `${dateVN(b.check_out)} · trước 12:00`],
    ["Số đêm", `${nights} đêm`],
    ["Số khách", `${b.adults} người lớn${b.children ? `, ${b.children} trẻ em` : ""}`],
    ["Khách hàng", `${b.guest_name} · ${b.guest_phone}`],
    ["Email", b.guest_email],
  ];

  return (
    <>
      <div className="relative bg-night pb-10 pt-28 text-white">
        <SiteHeader dark />
      </div>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">✓</div>
          <p className="eyebrow mt-6">Đặt phòng thành công</p>
          <h1 className="mt-3 font-serif text-4xl">Cảm ơn {b.guest_name.split(" ").slice(-1)[0]}!</h1>
          <p className="mt-3 text-muted">Chúng tôi đã ghi nhận yêu cầu và sẽ xác nhận trong vòng 30 phút.</p>
        </div>

        <div className="mt-10 border border-line bg-paper p-8">
          <div className="flex items-center justify-between border-b border-line pb-5">
            <div>
              <p className="label !mb-1">Mã đặt phòng</p>
              <p className="font-serif text-3xl tracking-widest">{b.code}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>
          <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
            {b.requests && (
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-muted">Yêu cầu</dt>
                <dd className="text-right">{b.requests}</dd>
              </div>
            )}
          </dl>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-muted">Tổng thanh toán</span>
            <span className="font-serif text-3xl">{vnd(b.total)}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">Hãy lưu lại mã đặt phòng. Thanh toán tại khách sạn khi nhận phòng.</p>
        <div className="mt-8 text-center">
          <Link href="/" className="btn btn-outline">Về trang chủ</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
