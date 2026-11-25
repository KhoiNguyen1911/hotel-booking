import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đăng nhập — Aurelia Grand Hotel" };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : user.role === "admin" ? "/admin" : "/account");

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-6 py-12">
      <div className="w-full max-w-sm bg-paper p-10">
        <p className="eyebrow text-center">Chào mừng trở lại</p>
        <h1 className="mt-3 text-center font-serif text-4xl uppercase tracking-[0.15em]">Aurelia</h1>
        <div className="mt-10">
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Chưa có tài khoản?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4 hover:text-gold">Đăng ký</Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-muted hover:text-gold">← Về website</Link>
        </p>
      </div>
    </main>
  );
}
