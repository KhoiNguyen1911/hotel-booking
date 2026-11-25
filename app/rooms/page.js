import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchBar from "@/components/SearchBar";
import RoomCard from "@/components/RoomCard";
import { searchRoomTypes, isValidRange, nightsBetween } from "@/lib/db";
import { dateVN } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Phòng & Suite — Aurelia Grand Hotel" };

export default async function RoomsPage({ searchParams }) {
  const sp = await searchParams;
  const checkIn = typeof sp.checkIn === "string" ? sp.checkIn : "";
  const checkOut = typeof sp.checkOut === "string" ? sp.checkOut : "";
  const guests = Math.min(4, Math.max(1, parseInt(sp.guests, 10) || 0)) || 0;

  const valid = isValidRange(checkIn, checkOut);
  const rooms = await searchRoomTypes({ checkIn: valid ? checkIn : "", checkOut: valid ? checkOut : "", guests: guests || undefined });
  const query = valid ? new URLSearchParams({ checkIn, checkOut, guests: String(guests || 2) }).toString() : "";

  return (
    <>
      <div className="relative bg-night pb-14 pt-32 text-white">
        <SiteHeader dark />
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow !text-gold">Phòng &amp; Suite</p>
          <h1 className="mt-4 font-serif text-5xl">Chọn không gian của bạn</h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-24">
        <div className="-mt-8 mb-10">
          <SearchBar variant="inline" initial={valid ? { checkIn, checkOut, guests: String(guests || 2) } : {}} />
        </div>

        {(checkIn || checkOut) && !valid && (
          <p role="alert" className="mb-8 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Ngày bạn chọn chưa hợp lệ. Ngày trả phòng phải sau ngày nhận phòng và không được ở trong quá khứ.
          </p>
        )}
        {valid && (
          <p className="mb-8 text-sm text-muted">
            {dateVN(checkIn)} → {dateVN(checkOut)} · {nightsBetween(checkIn, checkOut)} đêm · {rooms.filter((r) => r.available > 0).length} hạng phòng còn trống
          </p>
        )}

        {rooms.length === 0 ? (
          <p className="py-20 text-center text-muted">Không có hạng phòng phù hợp với số khách đã chọn.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => (
              <RoomCard key={r.id} room={r} query={query} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
