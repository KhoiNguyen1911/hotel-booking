import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteHeader({ dark = false }) {
  const user = await getCurrentUser();
  const base = dark ? "text-white" : "text-ink";
  const outline = dark ? "!border-white !text-white hover:!bg-white hover:!text-ink" : "";
  return (
    <header className={`absolute inset-x-0 top-0 z-20 ${base}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="whitespace-nowrap font-serif text-2xl tracking-[0.18em] uppercase">
          Aurelia
          <span className="ml-2 hidden text-[0.6rem] tracking-[0.4em] opacity-70 2xl:inline">Grand Hotel</span>
        </Link>
        <nav className="hidden items-center gap-9 whitespace-nowrap text-[0.72rem] uppercase tracking-[0.22em] xl:flex">
          <Link href="/#about" className="hover:text-gold">Giới thiệu</Link>
          <Link href="/rooms" className="hover:text-gold">Phòng &amp; Suite</Link>
          <Link href="/#experience" className="hover:text-gold">Trải nghiệm</Link>
          <Link href="/#contact" className="hover:text-gold">Liên hệ</Link>
        </nav>
        <div className="flex items-center gap-4 whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em]">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="hidden hover:text-gold sm:inline">Quản trị</Link>
              )}
              <Link href="/account" className="max-w-[10rem] truncate hover:text-gold" title={user.email}>
                {user.name.split(" ").slice(-1)[0]}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gold">Đăng nhập</Link>
              <Link href="/register" className="hidden hover:text-gold sm:inline">Đăng ký</Link>
            </>
          )}
          <Link href="/rooms" className={`btn btn-outline !py-2.5 ${outline}`}>Đặt phòng</Link>
        </div>
      </div>
    </header>
  );
}
