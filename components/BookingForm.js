"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { vnd } from "@/lib/format";

export default function BookingForm({ room, checkIn, checkOut, nights, maxGuests, soldOut, user }) {
  const router = useRouter();
  const [adults, setAdults] = useState(Math.min(2, maxGuests));
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = room.price * nights;

  async function submit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeSlug: room.slug,
          checkIn,
          checkOut,
          adults,
          children,
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          requests: fd.get("requests"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể đặt phòng.");
      router.push(`/booking/${data.code}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 border border-line bg-paper p-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <div>
          <p className="font-serif text-3xl">{vnd(room.price)}</p>
          <p className="text-xs text-muted">/ đêm</p>
        </div>
        <p className="text-sm text-muted">{nights} đêm</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="adults">Người lớn</label>
          <select id="adults" className="field" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="children">Trẻ em</label>
          <select id="children" className="field" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
            {Array.from({ length: Math.max(1, maxGuests - adults + 1) }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">Họ và tên</label>
        <input id="name" name="name" className="field" required minLength={2} placeholder="Nguyễn Văn A" defaultValue={user?.name || ""} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="field" required placeholder="email@example.com" defaultValue={user?.email || ""} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Điện thoại</label>
          <input id="phone" name="phone" className="field" required pattern="[0-9+ ]{8,15}" placeholder="0901234567" defaultValue={user?.phone || ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="requests">Yêu cầu đặc biệt (tuỳ chọn)</label>
        <textarea id="requests" name="requests" rows={3} className="field" maxLength={300} placeholder="Ví dụ: phòng tầng cao, kỷ niệm ngày cưới..." />
      </div>

      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Tổng cộng</span>
        <span className="font-serif text-3xl">{vnd(total)}</span>
      </div>

      {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

      <button type="submit" disabled={loading || soldOut} className="btn btn-gold w-full">
        {soldOut ? "Hết phòng" : loading ? "Đang xử lý..." : "Xác nhận đặt phòng"}
      </button>
      <p className="text-center text-xs text-muted">Thanh toán tại khách sạn. Miễn phí hủy trước 48 giờ.</p>
    </form>
  );
}
