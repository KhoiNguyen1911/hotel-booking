"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LABELS = { name: "họ tên", email: "email đăng nhập", phone: "số điện thoại", password: "mật khẩu" };

export default function AccountSettings({ user }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [loading, setLoading] = useState(false);
  const minPw = user.role === "admin" ? 10 : 8;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      currentPassword: fd.get("currentPassword"),
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
    };
    if (fd.get("newPassword")) {
      payload.newPassword = fd.get("newPassword");
      payload.confirmPassword = fd.get("confirmPassword");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      setDone(`Đã cập nhật: ${data.changed.map((k) => LABELS[k] || k).join(", ")}.`);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-12 border border-line bg-paper p-6 sm:p-8">
      <h2 className="font-serif text-3xl">Thông tin tài khoản</h2>
      <p className="mt-1 text-sm text-muted">Nhập mật khẩu hiện tại để lưu mọi thay đổi.</p>

      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2" key={`${user.name}|${user.email}|${user.phone}`}>
        <div>
          <label className="label" htmlFor="as-name">Họ và tên</label>
          <input id="as-name" name="name" className="field" defaultValue={user.name} required minLength={2} maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="as-email">Email đăng nhập</label>
          <input id="as-email" name="email" type="email" className="field" defaultValue={user.email} required />
        </div>
        <div>
          <label className="label" htmlFor="as-phone">Điện thoại</label>
          <input id="as-phone" name="phone" className="field" defaultValue={user.phone} pattern="[0-9+ ]{8,15}" />
        </div>
        <div className="hidden sm:block" />

        <div>
          <label className="label" htmlFor="as-new">Mật khẩu mới (bỏ trống nếu không đổi)</label>
          <input id="as-new" name="newPassword" type="password" autoComplete="new-password" className="field" minLength={minPw} maxLength={128} />
          <p className="mt-1 text-xs text-muted">Tối thiểu {minPw} ký tự.</p>
        </div>
        <div>
          <label className="label" htmlFor="as-confirm">Nhập lại mật khẩu mới</label>
          <input id="as-confirm" name="confirmPassword" type="password" autoComplete="new-password" className="field" />
        </div>

        <div className="sm:col-span-2 border-t border-line pt-5">
          <label className="label" htmlFor="as-current">Mật khẩu hiện tại</label>
          <input id="as-current" name="currentPassword" type="password" autoComplete="current-password" className="field sm:max-w-sm" required />
        </div>

        {error && <p role="alert" className="sm:col-span-2 text-sm text-rose-700">{error}</p>}
        {done && <p role="status" className="sm:col-span-2 text-sm text-emerald-700">{done}</p>}

        <div className="sm:col-span-2">
          <button className="btn btn-dark" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </form>
    </section>
  );
}
