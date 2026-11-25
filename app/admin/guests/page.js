import AdminShell from "@/components/AdminShell";
import { listGuests } from "@/lib/db";
import { vnd, dateVN } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Khách hàng — Aurelia Admin" };

export default async function AdminGuests() {
  const guests = await listGuests();
  return (
    <AdminShell active="/admin/guests" title="Khách hàng" subtitle={`${guests.length} khách · sắp xếp theo mức chi tiêu`}>
      <div className="overflow-x-auto border border-line bg-paper">
        <table className="tbl">
          <thead>
            <tr><th>Khách hàng</th><th>Liên hệ</th><th>Lượt đặt</th><th>Lần gần nhất</th><th>Tổng chi tiêu</th></tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id}>
                <td className="font-medium">{g.name}</td>
                <td>
                  <div>{g.email}</div>
                  <div className="text-xs text-muted">{g.phone}</div>
                </td>
                <td>{g.stays}</td>
                <td>{g.last_stay ? dateVN(g.last_stay) : "—"}</td>
                <td className="whitespace-nowrap font-serif text-lg">{vnd(g.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
