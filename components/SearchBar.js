"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function plus(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

export default function SearchBar({ initial = {}, variant = "hero" }) {
  const router = useRouter();
  const todayStr = iso(new Date());
  const [checkIn, setCheckIn] = useState(initial.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(initial.checkOut || plus(todayStr, 2));
  const [guests, setGuests] = useState(initial.guests || "2");

  function onCheckIn(v) {
    setCheckIn(v);
    if (v >= checkOut) setCheckOut(plus(v, 1));
  }

  function submit(e) {
    e.preventDefault();
    const q = new URLSearchParams({ checkIn, checkOut, guests });
    router.push(`/rooms?${q.toString()}`);
  }

  const shell =
    variant === "hero"
      ? "bg-paper/95 backdrop-blur shadow-2xl"
      : "bg-paper border border-line";

  return (
    <form onSubmit={submit} className={`grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end ${shell}`}>
      <div>
        <label className="label" htmlFor="ci">Nhận phòng</label>
        <input id="ci" type="date" className="field" min={todayStr} value={checkIn} onChange={(e) => onCheckIn(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="co">Trả phòng</label>
        <input id="co" type="date" className="field" min={plus(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="gu">Số khách</label>
        <select id="gu" className="field" value={guests} onChange={(e) => setGuests(e.target.value)}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} khách</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-gold h-[3.1rem]">Tìm phòng</button>
    </form>
  );
}
