import { differenceInSeconds, format } from "date-fns";

function leftPad(num: number): string {
  return ("00" + Math.floor(num)).slice(-2);
}

export function duration(from: Date, to?: Date): number {
  return to ? differenceInSeconds(to, from) : 0;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor(seconds / 60) - hours * 60;
  const secs = Math.floor(seconds % 60);

  return `${hours}h ${mins}m ${secs}s`.replace("0h ", "");
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
