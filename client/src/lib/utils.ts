import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a server timestamp as UTC so the browser converts it to local time
 * automatically (incl. German CET/CEST switch).
 * PostgreSQL returns timestamps like "2026-03-24 13:04:20.893" without a
 * timezone suffix — without "Z" browsers may parse them as local time, causing
 * a one-hour (or two-hour) offset.
 */
export function parseUTC(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  // Replace space separator with T for ISO 8601, then force Z (UTC) if missing
  const iso = dateStr.replace(" ", "T");
  if (!iso.endsWith("Z") && !iso.includes("+") && !iso.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(iso + "Z");
  }
  return new Date(iso);
}
