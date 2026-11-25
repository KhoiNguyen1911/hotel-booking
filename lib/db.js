import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password.js";

/**
 * Database layer (libSQL = SQLite-compatible).
 *  - Production: set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) -> data persists in Turso.
 *  - Local dev:  no env needed -> uses the file data/hotel.db.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS room_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  size INTEGER NOT NULL,
  bed TEXT NOT NULL,
  view TEXT NOT NULL,
  amenities TEXT NOT NULL,
  hue INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT UNIQUE NOT NULL,
  type_id INTEGER NOT NULL REFERENCES room_types(id),
  floor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
);
CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  UNIQUE(email)
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requests TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
`;

const ROOM_TYPES = [
  {
    slug: "deluxe",
    name: "Deluxe City View",
    tagline: "Không gian thanh lịch nhìn ra thành phố",
    description:
      "Căn phòng 38m² với cửa kính toàn phần, giường king-size đệm lông vũ và góc làm việc yên tĩnh. Phòng tắm đá cẩm thạch với vòi sen mưa và bồn tắm đứng.",
    price: 3200000,
    capacity: 2,
    size: 38,
    bed: "1 giường King",
    view: "Toàn cảnh thành phố",
    amenities: ["Wi-Fi tốc độ cao", "Minibar", "Máy pha cà phê Nespresso", "Két an toàn", "Smart TV 55 inch", "Dịch vụ phòng 24/7"],
    hue: 32,
  },
  {
    slug: "premier",
    name: "Premier Ocean View",
    tagline: "Thức dậy cùng tiếng sóng và chân trời xanh",
    description:
      "Phòng 46m² với ban công riêng hướng biển, khu vực tiếp khách riêng và bộ amenities L'Occitane. Lý tưởng cho kỳ nghỉ cặp đôi.",
    price: 4800000,
    capacity: 2,
    size: 46,
    bed: "1 giường King",
    view: "Hướng biển",
    amenities: ["Ban công riêng", "Bồn tắm đứng", "Minibar miễn phí lần đầu", "Máy pha cà phê Nespresso", "Áo choàng & dép cao cấp", "Check-in ưu tiên"],
    hue: 205,
  },
  {
    slug: "family",
    name: "Family Suite",
    tagline: "Rộng rãi cho cả gia đình cùng nghỉ dưỡng",
    description:
      "Suite 68m² gồm phòng ngủ chính và phòng ngủ phụ thông nhau, phòng khách rộng và bếp nhỏ. Có khu vui chơi và đồ dùng riêng cho trẻ em.",
    price: 6500000,
    capacity: 4,
    size: 68,
    bed: "1 King + 2 giường đơn",
    view: "Vườn nhiệt đới",
    amenities: ["2 phòng ngủ thông nhau", "Bếp nhỏ", "Đồ chơi & bộ đồ dùng trẻ em", "Ưu đãi Kids Club", "Smart TV 65 inch", "Bữa sáng cho 4 người"],
    hue: 140,
  },
  {
    slug: "executive",
    name: "Executive Suite",
    tagline: "Đẳng cấp công tác với đặc quyền Lounge",
    description:
      "Suite 72m² với phòng khách riêng, bàn làm việc rộng và quyền sử dụng Executive Lounge: bữa sáng, trà chiều và cocktail buổi tối.",
    price: 8200000,
    capacity: 3,
    size: 72,
    bed: "1 giường King",
    view: "Toàn cảnh thành phố",
    amenities: ["Executive Lounge", "Phòng khách riêng", "Bàn làm việc ergonomic", "Giặt ủi 2 món/ngày", "Đón sân bay miễn phí", "Late check-out 16:00"],
    hue: 262,
  },
  {
    slug: "presidential",
    name: "Presidential Suite",
    tagline: "Biểu tượng của sự xa hoa tuyệt đối",
    description:
      "Căn suite 180m² ở tầng cao nhất: phòng ngủ chính, phòng khách, phòng ăn riêng, hồ bơi vô cực trên sân thượng và quản gia riêng 24/7.",
    price: 28000000,
    capacity: 4,
    size: 180,
    bed: "1 King + 1 Queen",
    view: "Panorama 270°",
    amenities: ["Quản gia riêng 24/7", "Hồ bơi vô cực riêng", "Phòng ăn 8 chỗ", "Xe đón tiễn sang trọng", "Spa tại phòng", "Minibar & rượu vang cao cấp"],
    hue: 18,
  },
];

const ROOMS_PER_TYPE = { deluxe: 12, premier: 8, family: 6, executive: 4, presidential: 1 };

const GUESTS = [
  ["Nguyễn Minh Anh", "minhanh@example.com", "0901234567"],
  ["Trần Quốc Bảo", "quocbao@example.com", "0912345678"],
  ["Lê Thu Hà", "thuha@example.com", "0933456789"],
  ["Phạm Gia Huy", "giahuy@example.com", "0944567890"],
  ["Võ Ngọc Lan", "ngoclan@example.com", "0955678901"],
  ["Đặng Hoàng Nam", "hoangnam@example.com", "0966789012"],
  ["Bùi Khánh Linh", "khanhlinh@example.com", "0977890123"],
  ["Hoàng Đức Thịnh", "ducthinh@example.com", "0988901234"],
  ["James Carter", "james.carter@example.com", "+14155550123"],
  ["Sophie Laurent", "sophie.laurent@example.com", "+33612345678"],
  ["Kim Ji-woo", "jiwoo.kim@example.com", "+821012345678"],
  ["Tanaka Haruto", "haruto.tanaka@example.com", "+819012345678"],
];

/* ---------- Dates (always Vietnam time, so servers in UTC behave the same) ---------- */

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function fmtDate(d) {
  return dateFmt.format(d);
}

export function today() {
  return fmtDate(new Date());
}

function addDays(date, n) {
  return new Date(date.getTime() + n * 86400000);
}

export function nightsBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function isValidRange(checkIn, checkOut) {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(checkIn || "") || !re.test(checkOut || "")) return false;
  if (Number.isNaN(Date.parse(checkIn)) || Number.isNaN(Date.parse(checkOut))) return false;
  return checkOut > checkIn && checkIn >= today() && nightsBetween(checkIn, checkOut) <= 30;
}

/* ---------- Connection ---------- */

/** Removes whitespace/newlines, quotes and a "Bearer " prefix that often sneak in when pasting a token. */
export function cleanToken(raw) {
  const t = String(raw || "")
    .replace(/^\s*bearer\s+/i, "")
    .replace(/["'\s]/g, "");
  return t || undefined;
}

function createDb() {
  // Tolerate stray spaces or quotes pasted into the hosting dashboard.
  const remote = (process.env.TURSO_DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  if (remote) {
    // Serverless platforms handle plain HTTPS far better than libsql:// (WebSocket).
    const url = remote.replace(/^libsql:\/\//i, "https://");
    return createClient({ url, authToken: cleanToken(process.env.TURSO_AUTH_TOKEN) });
  }
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  // LOCAL_DB_FILE lets tests use a throwaway database instead of the real one.
  return createClient({ url: `file:${process.env.LOCAL_DB_FILE || "data/hotel.db"}` });
}

export const ADMIN_EMAIL = "admin@aurelia.example";

async function seed(c) {
  const count = (await c.execute("SELECT COUNT(*) AS c FROM room_types")).rows[0].c;
  if (Number(count) > 0) return;

  const stmts = [];
  const typeIds = {};
  ROOM_TYPES.forEach((t, i) => {
    typeIds[t.slug] = i + 1;
    stmts.push({
      sql: `INSERT OR IGNORE INTO room_types (id,slug,name,tagline,description,price,capacity,size,bed,view,amenities,hue)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [i + 1, t.slug, t.name, t.tagline, t.description, t.price, t.capacity, t.size, t.bed, t.view, JSON.stringify(t.amenities), t.hue],
    });
  });

  const roomsByType = {};
  let floor = 3;
  let n = 1;
  let roomId = 1;
  for (const t of ROOM_TYPES) {
    roomsByType[t.slug] = [];
    for (let i = 0; i < ROOMS_PER_TYPE[t.slug]; i++) {
      if (n > 6) {
        floor++;
        n = 1;
      }
      const number = `${floor}${String(n).padStart(2, "0")}`;
      stmts.push({
        sql: "INSERT OR IGNORE INTO rooms (id,number,type_id,floor,status) VALUES (?,?,?,?,?)",
        args: [roomId, number, typeIds[t.slug], floor, "available"],
      });
      roomsByType[t.slug].push({ id: roomId, price: t.price });
      roomId++;
      n++;
    }
    floor++;
    n = 1;
  }

  const guestIds = GUESTS.map((g, i) => {
    stmts.push({ sql: "INSERT OR IGNORE INTO guests (id,name,email,phone) VALUES (?,?,?,?)", args: [i + 1, ...g] });
    return i + 1;
  });

  // Deterministic pseudo-random bookings around today
  let seedVal = 20261125;
  const rnd = () => {
    seedVal = (seedVal * 1664525 + 1013904223) % 4294967296;
    return seedVal / 4294967296;
  };
  const now = new Date();
  const slugs = Object.keys(roomsByType);
  const weights = [0.4, 0.25, 0.15, 0.15, 0.05];
  const requests = ["", "", "Phòng tầng cao, yên tĩnh", "Kỷ niệm ngày cưới - xin trang trí hoa", "Đón sân bay lúc 14:00", "Giường phụ cho trẻ nhỏ", ""];
  const taken = [];
  const overlaps = (rid, a, b) => taken.some((t) => t.roomId === rid && t.a < b && t.b > a);
  const t0 = today();

  for (let i = 0; i < 90; i++) {
    let r = rnd();
    let ti = 0;
    for (; ti < weights.length - 1; ti++) {
      if (r < weights[ti]) break;
      r -= weights[ti];
    }
    const slug = slugs[ti];
    const pool = roomsByType[slug];
    const room = pool[Math.floor(rnd() * pool.length)];
    const offset = Math.floor(rnd() * 70) - 25;
    const nights = 1 + Math.floor(rnd() * 5);
    const ci = addDays(now, offset);
    const co = addDays(ci, nights);
    const a = fmtDate(ci);
    const b = fmtDate(co);
    if (overlaps(room.id, a, b)) continue;
    taken.push({ roomId: room.id, a, b });

    let status;
    if (b <= t0) status = rnd() < 0.08 ? "cancelled" : "checked_out";
    else if (a <= t0) status = "checked_in";
    else status = rnd() < 0.15 ? "pending" : rnd() < 0.05 ? "cancelled" : "confirmed";

    const typeInfo = ROOM_TYPES.find((x) => x.slug === slug);
    const adults = 1 + Math.floor(rnd() * Math.min(2, typeInfo.capacity));
    const children = typeInfo.capacity > 2 && rnd() < 0.4 ? 1 : 0;
    const code = "HB" + (100000 + Math.floor(rnd() * 899999));
    const created = fmtDate(addDays(ci, -Math.floor(rnd() * 20) - 1));
    stmts.push({
      sql: `INSERT OR IGNORE INTO bookings (code,room_id,guest_id,check_in,check_out,adults,children,total,status,requests,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [code, room.id, guestIds[Math.floor(rnd() * guestIds.length)], a, b, adults, children, room.price * nights, status, requests[Math.floor(rnd() * requests.length)], created],
    });
  }
  await c.batch(stmts, "write");
}

/** Ensures one admin exists. Password from ADMIN_PASSWORD; "admin123" is allowed only for local dev. */
async function seedAdmin(c) {
  const has = (await c.execute("SELECT 1 AS x FROM users WHERE role = 'admin' LIMIT 1")).rows[0];
  if (has) return;
  const isRemote = !!process.env.TURSO_DATABASE_URL;
  const password = process.env.ADMIN_PASSWORD || (isRemote ? null : "admin123");
  if (!password) {
    console.warn("[db] No admin created: set ADMIN_PASSWORD to create the admin account on a hosted database.");
    return;
  }
  await c.execute({
    sql: "INSERT OR IGNORE INTO users (name,email,phone,password_hash,role,created_at) VALUES (?,?,?,?,?,?)",
    args: ["Quản trị viên", ADMIN_EMAIL, "", hashPassword(password), "admin", today()],
  });
}

export async function getDb() {
  if (!globalThis.__hotelDb) {
    globalThis.__hotelDb = (async () => {
      const c = createDb();
      await c.executeMultiple(SCHEMA);
      await seed(c);
      await seedAdmin(c);
      return c;
    })().catch((e) => {
      globalThis.__hotelDb = null;
      throw e;
    });
  }
  return globalThis.__hotelDb;
}

/* ---------- Query helpers ---------- */

function rowsOf(res) {
  return res.rows.map((row) => Object.fromEntries(res.columns.map((col) => [col, row[col]])));
}

async function all(sql, args = [], exec) {
  const e = exec || (await getDb());
  return rowsOf(await e.execute({ sql, args }));
}

async function get(sql, args = [], exec) {
  return (await all(sql, args, exec))[0];
}

/* ---------- Room types ---------- */

function parseType(t) {
  return t ? { ...t, amenities: JSON.parse(t.amenities) } : null;
}

export async function getRoomTypes() {
  return (await all("SELECT * FROM room_types ORDER BY price")).map(parseType);
}

export async function getRoomType(slug) {
  return parseType(await get("SELECT * FROM room_types WHERE slug = ?", [slug]));
}

const AVAILABLE_SQL = `SELECT r.* FROM rooms r
  WHERE r.type_id = ? AND r.status != 'maintenance'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.room_id = r.id AND b.status != 'cancelled'
    AND b.check_in < ? AND b.check_out > ?
  ) ORDER BY r.number`;

/** Free (not overlapping) rooms of a type for a date range. */
export async function getAvailableRooms(typeId, checkIn, checkOut) {
  return all(AVAILABLE_SQL, [typeId, checkOut, checkIn]);
}

export async function searchRoomTypes({ checkIn, checkOut, guests }) {
  const types = await getRoomTypes();
  const valid = checkIn && checkOut && isValidRange(checkIn, checkOut);
  const filtered = types.filter((t) => !guests || t.capacity >= guests);
  return Promise.all(
    filtered.map(async (t) => ({ ...t, available: valid ? (await getAvailableRooms(t.id, checkIn, checkOut)).length : null }))
  );
}

/* ---------- Bookings ---------- */

export async function createBooking({ typeSlug, checkIn, checkOut, adults, children, name, email, phone, requests }) {
  const type = await getRoomType(typeSlug);
  if (!type) throw new Error("Hạng phòng không tồn tại.");
  if (!isValidRange(checkIn, checkOut)) throw new Error("Ngày nhận/trả phòng không hợp lệ.");
  if (adults + children > type.capacity || adults < 1) throw new Error(`Hạng phòng này tối đa ${type.capacity} khách.`);

  const c = await getDb();
  const tx = await c.transaction("write");
  try {
    const free = await all(AVAILABLE_SQL, [type.id, checkOut, checkIn], tx);
    if (free.length === 0) throw new Error("Rất tiếc, hạng phòng này đã hết trong thời gian bạn chọn.");
    const room = free[0];

    await tx.execute({
      sql: `INSERT INTO guests (name,email,phone) VALUES (?,?,?)
            ON CONFLICT(email) DO UPDATE SET name = excluded.name, phone = excluded.phone`,
      args: [name, email, phone],
    });
    const guest = await get("SELECT id FROM guests WHERE email = ?", [email], tx);

    const total = type.price * nightsBetween(checkIn, checkOut);
    let code;
    for (let i = 0; i < 5; i++) {
      code = "HB" + (100000 + Math.floor(Math.random() * 899999));
      if (!(await get("SELECT 1 AS x FROM bookings WHERE code = ?", [code], tx))) break;
    }
    await tx.execute({
      sql: `INSERT INTO bookings (code,room_id,guest_id,check_in,check_out,adults,children,total,status,requests,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [code, room.id, guest.id, checkIn, checkOut, adults, children, total, "pending", requests || "", today()],
    });
    await tx.commit();
    return code;
  } catch (e) {
    try {
      await tx.rollback();
    } catch {
      // transaction already closed
    }
    throw e;
  } finally {
    tx.close();
  }
}

const BOOKING_SELECT = `
  SELECT b.*, g.name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
         r.number AS room_number, rt.name AS type_name, rt.slug AS type_slug, rt.hue AS type_hue
  FROM bookings b
  JOIN guests g ON g.id = b.guest_id
  JOIN rooms r ON r.id = b.room_id
  JOIN room_types rt ON rt.id = r.type_id`;

export async function getBookingByCode(code) {
  return get(`${BOOKING_SELECT} WHERE b.code = ?`, [code]);
}

export async function listBookings({ status, q } = {}) {
  const where = [];
  const args = [];
  if (status && status !== "all") {
    where.push("b.status = ?");
    args.push(status);
  }
  if (q) {
    where.push("(b.code LIKE ? OR g.name LIKE ? OR g.email LIKE ? OR r.number LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like);
  }
  return all(`${BOOKING_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY b.check_in DESC, b.id DESC`, args);
}

export const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

export async function updateBookingStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error("Trạng thái không hợp lệ.");
  const c = await getDb();
  const r = await c.execute({ sql: "UPDATE bookings SET status = ? WHERE id = ?", args: [status, id] });
  return r.rowsAffected > 0;
}

export async function listBookingsByEmail(email) {
  return all(
    `SELECT b.*, r.number AS room_number, rt.name AS type_name, rt.slug AS type_slug
     FROM bookings b
     JOIN guests g ON g.id = b.guest_id
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.type_id
     WHERE g.email = ? ORDER BY b.check_in DESC`,
    [String(email).trim().toLowerCase()]
  );
}

/* ---------- Rooms & guests (admin) ---------- */

export async function listRooms() {
  const t = today();
  return all(
    `SELECT r.*, rt.name AS type_name, rt.slug AS type_slug, rt.price AS price,
      (SELECT g.name FROM bookings b JOIN guests g ON g.id = b.guest_id
        WHERE b.room_id = r.id AND b.status IN ('checked_in','confirmed','pending')
        AND b.check_in <= ? AND b.check_out > ? LIMIT 1) AS current_guest,
      (SELECT COUNT(*) FROM bookings b WHERE b.room_id = r.id AND b.status IN ('checked_in')
        AND b.check_in <= ? AND b.check_out > ?) AS occupied
     FROM rooms r JOIN room_types rt ON rt.id = r.type_id ORDER BY r.number`,
    [t, t, t, t]
  );
}

export async function updateRoomStatus(id, status) {
  if (!["available", "maintenance"].includes(status)) throw new Error("Trạng thái phòng không hợp lệ.");
  const c = await getDb();
  const r = await c.execute({ sql: "UPDATE rooms SET status = ? WHERE id = ?", args: [status, id] });
  return r.rowsAffected > 0;
}

export async function listGuests() {
  return all(
    `SELECT g.*, COUNT(b.id) AS stays, COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total END),0) AS spent,
            MAX(b.check_in) AS last_stay
     FROM guests g LEFT JOIN bookings b ON b.guest_id = g.id
     GROUP BY g.id ORDER BY spent DESC`
  );
}

/* ---------- Dashboard ---------- */

export async function getDashboardStats() {
  const t = today();
  const monthStart = t.slice(0, 7) + "-01";
  const dates = [];
  for (let i = -7; i <= 14; i++) dates.push(fmtDate(addDays(new Date(), i)));

  const [totalRooms, occupied, arrivals, departures, pending, revenueMonth, counts, byType] = await Promise.all([
    get("SELECT COUNT(*) AS c FROM rooms WHERE status != 'maintenance'"),
    get("SELECT COUNT(*) AS c FROM bookings WHERE status = 'checked_in' AND check_in <= ? AND check_out > ?", [t, t]),
    get("SELECT COUNT(*) AS c FROM bookings WHERE check_in = ? AND status IN ('pending','confirmed')", [t]),
    get("SELECT COUNT(*) AS c FROM bookings WHERE check_out = ? AND status = 'checked_in'", [t]),
    get("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending'"),
    get(
      "SELECT COALESCE(SUM(total),0) AS s FROM bookings WHERE status IN ('confirmed','checked_in','checked_out') AND check_in >= ? AND check_in <= ?",
      [monthStart, t.slice(0, 7) + "-31"]
    ),
    Promise.all(
      dates.map((d) =>
        get(
          "SELECT COUNT(*) AS c FROM bookings WHERE status IN ('confirmed','checked_in','checked_out','pending') AND check_in <= ? AND check_out > ?",
          [d, d]
        )
      )
    ),
    all(
      `SELECT rt.name, rt.hue, COUNT(b.id) AS bookings, COALESCE(SUM(b.total),0) AS revenue
       FROM room_types rt LEFT JOIN rooms r ON r.type_id = rt.id
       LEFT JOIN bookings b ON b.room_id = r.id AND b.status IN ('confirmed','checked_in','checked_out')
       GROUP BY rt.id ORDER BY revenue DESC`
    ),
  ]);

  const total = Number(totalRooms.c);
  const series = dates.map((d, i) => ({
    date: d,
    occupied: Number(counts[i].c),
    rate: total ? Math.round((Number(counts[i].c) / total) * 100) : 0,
  }));

  return {
    totalRooms: total,
    occupied: Number(occupied.c),
    arrivals: Number(arrivals.c),
    departures: Number(departures.c),
    pending: Number(pending.c),
    revenueMonth: Number(revenueMonth.s),
    series,
    byType,
  };
}

export async function listTodayMovements() {
  const t = today();
  return all(
    `${BOOKING_SELECT} WHERE (b.check_in = ? AND b.status IN ('pending','confirmed')) OR (b.check_out = ? AND b.status = 'checked_in') ORDER BY b.check_in`,
    [t, t]
  );
}

/* ---------- Users ---------- */

export async function getUserById(id) {
  return get("SELECT * FROM users WHERE id = ?", [id]);
}

export async function getUserByEmail(email) {
  return get("SELECT * FROM users WHERE email = ?", [String(email).trim().toLowerCase()]);
}

/** Updates only the fields that are provided. Throws if the new email belongs to someone else. */
export async function updateUserProfile(id, { name, email, phone, newPassword }) {
  const sets = [];
  const args = [];
  if (name !== undefined) {
    sets.push("name = ?");
    args.push(name);
  }
  if (email !== undefined) {
    const mail = String(email).trim().toLowerCase();
    const other = await getUserByEmail(mail);
    if (other && other.id !== id) throw new Error("Email này đã được sử dụng bởi tài khoản khác.");
    sets.push("email = ?");
    args.push(mail);
  }
  if (phone !== undefined) {
    sets.push("phone = ?");
    args.push(phone);
  }
  if (newPassword) {
    sets.push("password_hash = ?");
    args.push(hashPassword(newPassword));
  }
  if (sets.length === 0) return;
  const c = await getDb();
  try {
    await c.execute({ sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`, args: [...args, id] });
  } catch {
    throw new Error("Không thể cập nhật. Email có thể đã được sử dụng.");
  }
}

export async function createUser({ name, email, phone, password }) {
  const mail = String(email).trim().toLowerCase();
  if (await getUserByEmail(mail)) throw new Error("Email này đã được đăng ký.");
  const c = await getDb();
  try {
    await c.execute({
      sql: "INSERT INTO users (name,email,phone,password_hash,role,created_at) VALUES (?,?,?,?,?,?)",
      args: [name, mail, phone || "", hashPassword(password), "guest", today()],
    });
  } catch {
    throw new Error("Email này đã được đăng ký.");
  }
  return (await getUserByEmail(mail)).id;
}
