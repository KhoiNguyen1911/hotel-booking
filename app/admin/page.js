import AdminShell from "@/components/AdminShell";
import StatusBadge from "@/components/StatusBadge";
import { BookingActions } from "@/components/AdminClient";
import { getDashboardStats, listTodayMovements, today } from "@/lib/db";
import { vnd, vndShort, dateVN } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tổng quan — Aurelia Admin" };

function Kpi({ label, value, hint }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="label !mb-2">{label}</p>
      <p className="font-serif text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const [s, movements] = await Promise.all([getDashboardStats(), listTodayMovements()]);
  const t = today();
  const occRate = s.totalRooms ? Math.round((s.occupied / s.totalRooms) * 100) : 0;
  const maxRev = Math.max(1, ...s.byType.map((x) => x.revenue));

  const W = 640;
  const H = 180;
  const barW = W / s.series.length;

  return (
    <AdminShell active="/admin" title="Tổng quan" subtitle={`Hôm nay, ${dateVN(t)}`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Công suất phòng" value={`${occRate}%`} hint={`${s.occupied}/${s.totalRooms} phòng đang có khách`} />
        <Kpi label="Đến hôm nay" value={s.arrivals} hint="Khách chờ check-in" />
        <Kpi label="Đi hôm nay" value={s.departures} hint="Khách chờ check-out" />
        <Kpi label="Chờ xác nhận" value={s.pending} hint="Đơn cần xử lý" />
        <Kpi label="Doanh thu tháng" value={vndShort(s.revenueMonth)} hint={vnd(s.revenueMonth)} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl">Công suất phòng theo ngày</h2>
          <p className="text-xs text-muted">7 ngày trước → 14 ngày tới (% phòng có đặt)</p>
          <svg viewBox={`0 0 ${W} ${H + 28}`} className="mt-5 w-full" role="img" aria-label="Biểu đồ công suất phòng">
            {[0, 50, 100].map((g) => (
              <g key={g}>
                <line x1="0" x2={W} y1={H - (g / 100) * H} y2={H - (g / 100) * H} stroke="var(--line)" strokeDasharray="3 4" />
                <text x="2" y={H - (g / 100) * H - 3} fontSize="9" fill="var(--muted)">{g}%</text>
              </g>
            ))}
            {s.series.map((d, i) => {
              const h = (Math.min(100, d.rate) / 100) * H;
              const isToday = d.date === t;
              return (
                <g key={d.date}>
                  <rect x={i * barW + 4} y={H - h} width={barW - 8} height={h} fill={isToday ? "var(--gold-dark)" : "var(--gold)"} opacity={d.date < t ? 0.45 : 0.9} />
                  {i % 3 === 0 && (
                    <text x={i * barW + barW / 2} y={H + 16} fontSize="9" textAnchor="middle" fill="var(--muted)">
                      {d.date.slice(8)}/{d.date.slice(5, 7)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="font-serif text-2xl">Doanh thu theo hạng phòng</h2>
          <ul className="mt-5 space-y-4">
            {s.byType.map((x) => (
              <li key={x.name}>
                <div className="flex justify-between text-sm">
                  <span>{x.name}</span>
                  <span className="text-muted">{vndShort(x.revenue)}</span>
                </div>
                <div className="mt-1.5 h-2 bg-cream">
                  <div className="h-full" style={{ width: `${(x.revenue / maxRev) * 100}%`, background: `hsl(${x.hue} 45% 45%)` }} />
                </div>
                <p className="mt-1 text-xs text-muted">{x.bookings} lượt đặt</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 border border-line bg-paper">
        <div className="p-6 pb-3">
          <h2 className="font-serif text-2xl">Check-in / Check-out hôm nay</h2>
        </div>
        {movements.length === 0 ? (
          <p className="p-6 pt-2 text-sm text-muted">Không có lượt đến hoặc đi nào cần xử lý hôm nay.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr><th>Mã</th><th>Khách</th><th>Phòng</th><th>Loại</th><th>Trạng thái</th><th></th></tr>
              </thead>
              <tbody>
                {movements.map((b) => (
                  <tr key={b.id}>
                    <td className="font-medium">{b.code}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.room_number}</td>
                    <td>{b.check_in === t ? "Đến" : "Đi"} · {b.type_name}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><BookingActions id={b.id} status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
