export function vnd(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

export function vndShort(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " tr";
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function dateVN(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đang lưu trú",
  checked_out: "Đã trả phòng",
  cancelled: "Đã hủy",
};

export const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  checked_in: "bg-emerald-100 text-emerald-800",
  checked_out: "bg-stone-200 text-stone-700",
  cancelled: "bg-rose-100 text-rose-800",
};
