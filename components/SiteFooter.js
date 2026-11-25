import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="contact" className="mt-auto bg-night text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-3xl uppercase tracking-[0.18em] text-white">Aurelia</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-stone-400">
            Khách sạn 5 sao nơi sự tinh tế gặp gỡ lòng hiếu khách. Mỗi khoảnh khắc lưu trú là một trải nghiệm được chăm chút tỉ mỉ.
          </p>
        </div>
        <div className="text-sm leading-8">
          <p className="eyebrow !text-gold">Liên hệ</p>
          <p className="mt-3">88 Thùy Vân, Bãi Sau, Vũng Tàu</p>
          <p>+84 254 3888 888</p>
          <p>reservations@aurelia.example</p>
        </div>
        <div className="text-sm leading-8">
          <p className="eyebrow !text-gold">Khám phá</p>
          <p className="mt-3"><Link href="/rooms" className="hover:text-white">Phòng &amp; Suite</Link></p>
          <p><Link href="/#experience" className="hover:text-white">Trải nghiệm</Link></p>
          <p><Link href="/admin" className="hover:text-white">Quản trị</Link></p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs tracking-wider text-stone-500">
        © 2026 Aurelia Grand Hotel — Bản demo hệ thống đặt phòng.
        <p className="mx-auto mt-2 max-w-3xl px-6 text-[0.7rem] leading-5 text-stone-600">
          Ảnh: &quot;Bờ biển Vũng Tàu&quot; của Hoangvantoanajc (
          <a href="https://creativecommons.org/licenses/by-sa/3.0" className="underline" rel="noreferrer">CC BY-SA 3.0</a>
          ); &quot;On the Back Beach 1&quot; và &quot;Biển bãi sau - Gần Hòn Bà&quot; của Willyvu (
          <a href="https://creativecommons.org/licenses/by-sa/4.0" className="underline" rel="noreferrer">CC BY-SA 4.0</a>
          ), qua{" "}
          <a href="https://commons.wikimedia.org/wiki/Category:Vũng_Tàu" className="underline" rel="noreferrer">Wikimedia Commons</a>. Đã thay đổi kích thước.
        </p>
      </div>
    </footer>
  );
}
