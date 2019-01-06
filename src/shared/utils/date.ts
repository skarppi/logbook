import { differenceInSeconds, format } from "date-fns";

function leftPad(num: number): string {
  return ("00" + Math.floor(num)).slice(-2);
}

export function duration(from: Date, to?: Date): number {
  return to ? differenceInSeconds(to, from) : 0;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${seconds % 60}`;
}

export function formatDate(
  date: Date,
  dateFormat: string = "YYYY-MM-DD"
): string {
  return format(date, dateFormat);
}

export function formatDateTime(
  date: Date,
  dateFormat: string = "YYYY-MM-DD HH:mm:ss"
): string {
  return format(date, dateFormat);
}
