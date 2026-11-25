import AdminShell from "@/components/AdminShell";
import { RoomToggle } from "@/components/AdminClient";
import { listRooms } from "@/lib/db";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Phòng — Aurelia Admin" };

function stateOf(r) {
  if (r.status === "maintenance") return ["Bảo trì", "bg-orange-100 text-orange-800"];
  if (r.occupied) return ["Có khách", "bg-emerald-100 text-emerald-800"];
  if (r.current_guest) return ["Đã đặt", "bg-sky-100 text-sky-800"];
  return ["Trống", "bg-stone-100 text-stone-700"];
}

export default async function AdminRooms() {
  const rooms = await listRooms();
  const floors = [...new Set(rooms.map((r) => r.floor))];
  return (
    <AdminShell active="/admin/rooms" title="Phòng" subtitle={`${rooms.length} phòng · tình trạng hôm nay`}>
      <div className="space-y-8">
        {floors.map((f) => (
          <section key={f}>
            <h2 className="mb-3 font-serif text-xl">Tầng {f}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rooms
                .filter((r) => r.floor === f)
                .map((r) => {
                  const [label, cls] = stateOf(r);
                  return (
                    <div key={r.id} className="flex items-center justify-between border border-line bg-paper p-4">
                      <div>
                        <p className="font-serif text-2xl">{r.number}</p>
                        <p className="text-xs text-muted">{r.type_name} · {vnd(r.price)}</p>
                        {r.current_guest && <p className="mt-1 text-xs">{r.current_guest}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs ${cls}`}>{label}</span>
                        <RoomToggle id={r.id} status={r.status} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
