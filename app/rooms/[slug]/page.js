import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RoomVisual from "@/components/RoomVisual";
import BookingForm from "@/components/BookingForm";
import SearchBar from "@/components/SearchBar";
import { getRoomType, getAvailableRooms, isValidRange, nightsBetween } from "@/lib/db";
import { dateVN } from "@/lib/format";
import { findGallery } from "@/lib/images";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const room = await getRoomType(slug);
  return { title: room ? `${room.name} — Aurelia Grand Hotel` : "Không tìm thấy phòng" };
}

export default async function RoomDetail({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const room = await getRoomType(slug);
  if (!room) notFound();

  const checkIn = typeof sp.checkIn === "string" ? sp.checkIn : "";
  const checkOut = typeof sp.checkOut === "string" ? sp.checkOut : "";
  const valid = isValidRange(checkIn, checkOut);
  const available = valid ? (await getAvailableRooms(room.id, checkIn, checkOut)).length : null;
  const gallery = findGallery(room.slug).slice(1);
  const user = await getCurrentUser();

  return (
    <>
      <div className="relative bg-night pb-10 pt-28 text-white">
        <SiteHeader dark />
        <div className="mx-auto max-w-7xl px-6">
          <Link href={valid ? `/rooms?checkIn=${checkIn}&checkOut=${checkOut}` : "/rooms"} className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white">
            ← Tất cả phòng
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <RoomVisual hue={room.hue} slug={room.slug} label={room.view} className="aspect-[16/10]" />
            {gallery.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {gallery.slice(0, 6).map((g) => (
                  <RoomVisual key={g} src={g} hue={room.hue} className="aspect-[4/3]" />
                ))}
              </div>
            )}
            <p className="eyebrow mt-10">{room.size} m² · {room.bed} · tối đa {room.capacity} khách</p>
            <h1 className="mt-3 font-serif text-5xl">{room.name}</h1>
            <p className="mt-2 font-serif text-xl italic text-muted">{room.tagline}</p>
            <p className="mt-6 max-w-2xl leading-8 text-muted">{room.description}</p>

            <h2 className="mt-12 font-serif text-2xl">Tiện nghi</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {room.amenities.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-line pb-3">
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            {valid ? (
              <>
                <p className="mb-3 text-sm text-muted">
                  {dateVN(checkIn)} → {dateVN(checkOut)} ·{" "}
                  {available > 0 ? <span className="text-emerald-700">còn {available} phòng</span> : <span className="text-rose-700">đã hết phòng</span>}
                </p>
                <BookingForm room={room} checkIn={checkIn} checkOut={checkOut} nights={nightsBetween(checkIn, checkOut)} maxGuests={room.capacity} soldOut={available === 0} user={user} />
              </>
            ) : (
              <div>
                <p className="mb-3 text-sm text-muted">Chọn ngày lưu trú để xem tình trạng phòng và đặt phòng.</p>
                <SearchBar variant="inline" />
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
