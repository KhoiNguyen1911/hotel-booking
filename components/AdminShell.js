import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "./AdminClient";

const NAV = [
  ["/admin", "Tổng quan"],
  ["/admin/bookings", "Đặt phòng"],
  ["/admin/rooms", "Phòng"],
  ["/admin/guests", "Khách hàng"],
];

export default async function AdminShell({ active, title, subtitle, children }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-night text-stone-300 md:w-60 md:shrink-0">
        <div className="flex items-center justify-between px-6 py-6 md:block">
          <Link href="/" className="font-serif text-xl uppercase tracking-[0.18em] text-white">Aurelia</Link>
          <p className="hidden pt-1 text-[0.6rem] uppercase tracking-[0.35em] text-gold md:block">Quản trị</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap px-3 py-2.5 text-sm transition-colors ${
                active === href ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-6 pt-10 md:block">
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="md:hidden"><LogoutButton /></div>
        </div>
        {children}
      </main>
    </div>
  );
}
