"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ tone = "light" }) {
  const router = useRouter();
  async function out() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  const cls =
    tone === "dark"
      ? "text-xs uppercase tracking-[0.18em] text-muted hover:text-ink"
      : "text-xs uppercase tracking-[0.18em] text-stone-400 hover:text-white";
  return (
    <button onClick={out} className={cls}>
      Đăng xuất
    </button>
  );
}

const NEXT_ACTIONS = {
  pending: [
    ["confirmed", "Xác nhận", "btn-dark"],
    ["cancelled", "Hủy", "btn-outline"],
  ],
  confirmed: [
    ["checked_in", "Check-in", "btn-dark"],
    ["cancelled", "Hủy", "btn-outline"],
  ],
  checked_in: [["checked_out", "Check-out", "btn-dark"]],
  checked_out: [],
  cancelled: [["pending", "Khôi phục", "btn-outline"]],
};

export function BookingActions({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error || "Lỗi cập nhật.");
  }

  const actions = NEXT_ACTIONS[status] || [];
  return (
    <div className="flex items-center gap-2">
      {actions.map(([next, label, cls]) => (
        <button key={next} disabled={busy} onClick={() => change(next)} className={`btn ${cls} !px-3 !py-1.5 !text-[0.65rem]`}>
          {label}
        </button>
      ))}
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}

export function RoomToggle({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const next = status === "maintenance" ? "available" : "maintenance";

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button disabled={busy} onClick={toggle} className="btn btn-outline !px-3 !py-1.5 !text-[0.65rem]">
      {status === "maintenance" ? "Mở lại" : "Bảo trì"}
    </button>
  );
}
