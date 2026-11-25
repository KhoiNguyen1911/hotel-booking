import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đăng ký — Aurelia Grand Hotel" };

export default async function RegisterPage({ searchParams }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/account");

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-6 py-12">
      <div className="w-full max-w-sm bg-paper p-10">
        <p className="eyebrow text-center">Tạo tài khoản</p>
        <h1 className="mt-3 text-center font-serif text-4xl uppercase tracking-[0.15em]">Aurelia</h1>
        <p className="mt-4 text-center text-sm text-muted">Quản lý đặt phòng và nhận ưu đãi thành viên.</p>
        <div className="mt-8">
          <RegisterForm next={next} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Đã có tài khoản?{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4 hover:text-gold">Đăng nhập</Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-muted hover:text-gold">← Về website</Link>
        </p>
      </div>
    </main>
  );
}
