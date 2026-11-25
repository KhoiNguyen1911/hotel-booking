import Link from "next/link";
import RoomVisual from "./RoomVisual";
import { vnd } from "@/lib/format";

export default function RoomCard({ room, query = "" }) {
  const soldOut = room.available === 0;
  const href = `/rooms/${room.slug}${query ? `?${query}` : ""}`;
  return (
    <article className="group flex flex-col overflow-hidden border border-line bg-paper transition-shadow hover:shadow-xl">
      <Link href={href} className="block overflow-hidden">
        <RoomVisual hue={room.hue} slug={room.slug} label={room.view} className="aspect-[4/3] transition-transform duration-700 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{room.size} m² · {room.bed}</p>
        <h3 className="mt-2 font-serif text-2xl">{room.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{room.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {room.amenities.slice(0, 3).map((a) => (
            <li key={a}>· {a}</li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="font-serif text-2xl">{vnd(room.price)}</p>
            <p className="text-xs text-muted">/ đêm · tối đa {room.capacity} khách</p>
          </div>
          {room.available !== null && room.available !== undefined && (
            <p className={`text-xs ${soldOut ? "text-rose-700" : "text-emerald-700"}`}>
              {soldOut ? "Hết phòng" : `Còn ${room.available} phòng`}
            </p>
          )}
        </div>
        <Link href={href} className={`btn mt-5 ${soldOut ? "btn-outline pointer-events-none opacity-50" : "btn-dark"}`}>
          {soldOut ? "Không khả dụng" : "Xem chi tiết"}
        </Link>
      </div>
    </article>
  );
}
