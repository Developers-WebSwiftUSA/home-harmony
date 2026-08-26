/** Format a local calendar Date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalize tour.date (ISO string or Date) to YYYY-MM-DD for local comparisons. */
export function getTourDateString(date: string | Date | undefined | null): string {
  if (!date) return "";

  if (typeof date === "string") {
    const isoPrefix = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoPrefix) return isoPrefix[1];
  }

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalize time strings like "9:00", "09:00:00", or "9:00 AM" to HH:MM. */
export function normalizeTourTime(time: string | undefined | null): string | null {
  if (!time || typeof time !== "string") return null;

  const trimmed = time.trim();

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const period = match12[3].toUpperCase();
    if (hours < 1 || hours > 12 || minutes < 0 || minutes >= 60) return null;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
}

/** Build a local Date from tour date + startTime (e.g. "09:00"). */
export function getTourDateTime(
  date: string | Date | undefined | null,
  startTime: string | undefined | null
): Date | null {
  const dateStr = getTourDateString(date);
  const normalizedTime = normalizeTourTime(startTime);
  if (!dateStr || !normalizedTime) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = normalizedTime.split(":").map(Number);
  if ([year, month, day, hours, minutes].some((n) => Number.isNaN(n))) return null;

  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTourCountdown(date: string | Date | undefined | null, startTime: string | undefined | null): string {
  const tourDateTime = getTourDateTime(date, startTime);
  if (!tourDateTime) return "";

  const diff = tourDateTime.getTime() - Date.now();
  if (Number.isNaN(diff)) return "";
  if (diff <= 0) return "Tour time has passed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if ([days, hours, minutes].some((n) => Number.isNaN(n))) return "";

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(minutes, 0)}m`;
}

export function isTourUpcoming(
  date: string | Date | undefined | null,
  startTime: string | undefined | null
): boolean {
  const tourDateTime = getTourDateTime(date, startTime);
  return tourDateTime ? tourDateTime.getTime() > Date.now() : false;
}

export function isTourPast(
  date: string | Date | undefined | null,
  startTime: string | undefined | null
): boolean {
  const tourDateTime = getTourDateTime(date, startTime);
  return tourDateTime ? tourDateTime.getTime() < Date.now() : false;
}
