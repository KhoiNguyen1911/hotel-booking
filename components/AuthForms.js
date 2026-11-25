"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function safeNext(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

function useAuthSubmit(endpoint, next) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      router.push(safeNext(next) || (data.role === "admin" ? "/admin" : "/account"));
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }
  return { submit, error, loading };
}

export function LoginForm({ next }) {
  const { submit, error, loading } = useAuthSubmit("/api/auth/login", next);
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="field" required autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="field" required />
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <button className="btn btn-dark w-full" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
    </form>
  );
}

export function RegisterForm({ next }) {
  const { submit, error, loading } = useAuthSubmit("/api/auth/register", next);
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label" htmlFor="name">Họ và tên</label>
        <input id="name" name="name" autoComplete="name" className="field" required minLength={2} maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="field" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">Điện thoại (tuỳ chọn)</label>
        <input id="phone" name="phone" autoComplete="tel" className="field" pattern="[0-9+ ]{8,15}" placeholder="0901234567" />
      </div>
      <div>
        <label className="label" htmlFor="password">Mật khẩu (tối thiểu 8 ký tự)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className="field" required minLength={8} maxLength={128} />
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <button className="btn btn-dark w-full" disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
    </form>
  );
}
