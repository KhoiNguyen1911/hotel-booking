import { STATUS_LABEL, STATUS_STYLE } from "@/lib/format";

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[status] || "bg-stone-100"}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}
