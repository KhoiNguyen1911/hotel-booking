import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchBar from "@/components/SearchBar";
import RoomCard from "@/components/RoomCard";
import { getRoomTypes } from "@/lib/db";
import { findImage } from "@/lib/images";

export const dynamic = "force-dynamic";

const EXPERIENCES = [
  { title: "Aurelia Spa", text: "Liệu trình thư giãn kéo dài 90 phút với tinh dầu thiên nhiên và đá nóng.", hue: 160 },
  { title: "Nhà hàng Lumière", text: "Ẩm thực Pháp – Việt đương đại do bếp trưởng đạt sao Michelin dẫn dắt.", hue: 18 },
  { title: "Hồ bơi vô cực", text: "Tầng 28, nhìn ra Bãi Sau và toàn cảnh biển Vũng Tàu, mở cửa đến 22:00.", hue: 205 },
  { title: "Sky Bar", text: "Cocktail thủ công cùng hoàng hôn rực rỡ trên tầng thượng.", hue: 275 },
];

export default async function Home() {
  const rooms = (await getRoomTypes()).slice(0, 3);
  const heroImg = findImage("hero");
  return (
    <>
      <section className="relative isolate flex min-h-[92vh] flex-col justify-end overflow-hidden bg-night text-white">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(169,132,80,0.55), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(60,45,30,0.9), transparent 60%), linear-gradient(160deg, #1c1611, #0d0a07)",
          }}
        />
        {heroImg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt="Aurelia Grand Hotel" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 90px)" }} />
        )}
        <SiteHeader dark />
        <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-40">
          <p className="eyebrow fade-up !text-gold">Khách sạn 5 sao · Bãi Sau, Vũng Tàu</p>
          <h1 className="fade-up mt-5 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-7xl" style={{ animationDelay: "0.1s" }}>
            Nơi sự tinh tế
            <br />
            trở thành <em className="text-gold">trải nghiệm</em>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base leading-8 text-stone-300" style={{ animationDelay: "0.2s" }}>
            Chào mừng đến Aurelia Grand Hotel, ngay trên Bãi Sau Vũng Tàu — 186 phòng và suite sang trọng, spa đẳng cấp, ẩm thực tinh hoa và dịch vụ quản gia 24/7.
          </p>
          <div className="fade-up mt-12" style={{ animationDelay: "0.3s" }}>
            <SearchBar />
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow">Giới thiệu</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Một thập kỷ định nghĩa chuẩn mực nghỉ dưỡng</h2>
        </div>
        <div className="space-y-5 text-[0.95rem] leading-8 text-muted">
          <p>
            Tọa lạc trên đường Thùy Vân, vài bước chân là tới Bãi Sau và cách trung tâm Vũng Tàu vài phút di chuyển, Aurelia nằm cách TP. Hồ Chí Minh khoảng 2 giờ lái xe và đã đón hơn nửa triệu lượt khách từ năm 2016. Mỗi chi tiết — từ ga giường lụa Ý đến hương thơm đặc trưng trong sảnh — đều được chọn lọc để mang đến cảm giác an yên tuyệt đối.
          </p>
          <div className="grid grid-cols-3 gap-6 border-t border-line pt-8 text-ink">
            <div>
              <p className="font-serif text-4xl">5★</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">Tiêu chuẩn</p>
            </div>
            <div>
              <p className="font-serif text-4xl">186</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">Phòng &amp; Suite</p>
            </div>
            <div>
              <p className="font-serif text-4xl">24/7</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">Quản gia riêng</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="eyebrow">Phòng &amp; Suite</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Không gian dành cho bạn</h2>
            </div>
            <Link href="/rooms" className="hidden text-xs uppercase tracking-[0.2em] underline underline-offset-8 hover:text-gold sm:block">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {rooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="bg-night py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow !text-gold">Trải nghiệm</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl sm:text-5xl">Hơn cả một nơi để nghỉ ngơi</h2>
          <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCES.map((e) => (
              <div key={e.title} className="bg-night p-8 transition-colors hover:bg-white/5">
                <div className="mb-6 h-px w-10" style={{ background: `hsl(${e.hue} 50% 60%)` }} />
                <h3 className="font-serif text-2xl">{e.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-400">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="eyebrow">Đặt phòng trực tiếp</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Giá tốt nhất, ưu đãi riêng cho thành viên</h2>
        <p className="mx-auto mt-5 max-w-xl text-muted leading-8">
          Đặt trực tiếp trên website để nhận bữa sáng miễn phí, nâng hạng phòng khi còn trống và hủy miễn phí trước 48 giờ.
        </p>
        <Link href="/rooms" className="btn btn-dark mt-9">Đặt phòng ngay</Link>
      </section>

      <SiteFooter />
    </>
  );
}
