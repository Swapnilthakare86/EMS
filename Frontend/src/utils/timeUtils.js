// ─── Store UTC, Display IST ───────────────────────────────────────────────
// Backend stores: "HH:MM:SS" (UTC)
// Frontend shows: converted to user's local time (en-IN = IST)

const LOCALE  = "en-IN";
const TZ      = "Asia/Kolkata";

/**
 * Format a TIME string "HH:MM:SS" (stored as UTC) → "10:30 AM" in IST
 */
export function formatTime(timeStr) {
  if (!timeStr || timeStr === "-" || timeStr === "00:00:00") return "-";
  // Combine with today's UTC date so JS can convert timezone correctly
  const todayUTC = new Date().toISOString().slice(0, 10);
  const dt = new Date(`${todayUTC}T${timeStr}Z`); // Z = UTC
  if (isNaN(dt)) return timeStr;
  return dt.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: TZ });
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
 * Get today's date in YYYY-MM-DD (UTC) — for DB queries
 */
export function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get current time in HH:MM:SS (UTC) — for storing in DB
 */
export function nowTimeUTC() {
  return new Date().toISOString().slice(11, 19);
}

/**
 * Calculate working hours between two UTC time strings.
 * If checkOut is missing and isToday=true, calculates from checkIn to NOW.
 */
export function getWorkingHours(checkIn, checkOut, isToday = false) {
  if (!checkIn || checkIn === "-") return 0;
  const base  = "1970-01-01T";
  const start = new Date(`${base}${checkIn}Z`);
  // If no checkout and it's today → use current UTC time as end
  const nowUTC = new Date().toISOString().slice(11, 19);
  const endStr = (!checkOut || checkOut === "-" || checkOut === "00:00:00")
    ? (isToday ? nowUTC : null)
    : checkOut;
  if (!endStr) return 0;
  const end = new Date(`${base}${endStr}Z`);
  if (end <= start) return 0;
  return (end - start) / (1000 * 60 * 60);
}

/**
 * Format working hours as "08:30 hrs"
 * Pass isToday=true when checkout is missing but employee is still working
 */
export function formatHours(checkIn, checkOut, isToday = false) {
  const h = getWorkingHours(checkIn, checkOut, isToday);
  if (!h) return "-";
  const hrs  = Math.floor(h);
  const mins = Math.round((h % 1) * 60);
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
}
