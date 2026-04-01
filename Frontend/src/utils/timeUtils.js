// ─── Store IST, Display IST ───────────────────────────────────────────────
// Backend stores: "HH:MM:SS" (IST)
// Frontend shows: IST directly without UTC conversion

const LOCALE  = "en-IN";
const TZ      = "Asia/Kolkata";

/**
 * Format a TIME string "HH:MM:SS" (stored as IST) → "10:30 AM"
 */
export function formatTime(timeStr) {
  if (!timeStr || timeStr === "-" || timeStr === "00:00:00") return "-";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`;
}

/**
 * Format a DATE string "YYYY-MM-DD" → "25/03/2026" in IST
 */
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const dt = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(dt)) return dateStr;
  return dt.toLocaleDateString(LOCALE, { timeZone: TZ });
}

/**
 * Format a full ISO datetime string → "25/03/2026, 10:30 AM" in IST
 */
export function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  const dt = new Date(isoStr);
  if (isNaN(dt)) return isoStr;
  return dt.toLocaleString(LOCALE, { timeZone: TZ });
}

/**
 * Get today's date in YYYY-MM-DD (IST) — for DB queries
 */
export function todayUTC() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Get current time in HH:MM:SS (IST) — for storing in DB
 */
export function nowTimeUTC() {
  return new Date().toLocaleTimeString("en-GB", { timeZone: TZ, hour12: false });
}

/**
 * Calculate working hours between two IST time strings.
 * If checkOut is missing and isToday=true, calculates from checkIn to NOW.
 */
export function getWorkingHours(checkIn, checkOut, isToday = false) {
  if (!checkIn || checkIn === "-") return 0;
  const base  = "1970-01-01T";
  const start = new Date(`${base}${checkIn}`);

  // If no checkout and it's today → use current IST time as end
  const nowIST = new Date().toLocaleTimeString("en-GB", { timeZone: TZ, hour12: false });
  const endStr = (!checkOut || checkOut === "-" || checkOut === "00:00:00")
    ? (isToday ? nowIST : null)
    : checkOut;
  if (!endStr) return 0;
  const end = new Date(`${base}${endStr}`);
  if (end <= start) return 0;
  return (end - start) / (1000 * 60 * 60);
}

/**
 * Format working hours as "08h 30m"
 * Pass isToday=true when checkout is missing but employee is still working
 */
export function formatHours(checkIn, checkOut, isToday = false) {
  const h = getWorkingHours(checkIn, checkOut, isToday);
  if (!h) return "-";
  const hrs  = Math.floor(h);
  const mins = Math.round((h % 1) * 60);
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
}