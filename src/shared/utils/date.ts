import { differenceInSeconds, format } from "date-fns";

export function durationInSeconds(from: Date, to?: Date): number {
  return to ? differenceInSeconds(to, from) : 0;
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds / 3600) - days * 24;
  const mins = Math.floor(seconds / 60) - hours * 60;
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h`.replace(" 0h", "");
  } else if (hours > 0) {
    return `${hours}h ${mins}m`.replace(" 0m", "");
  } else {
    return `${mins}m ${secs}s`.replace(" 0s", " ").replace("/0m /", "");
  }
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

export function formatTime(
  date: Date,
  dateFormat: string = "HH:mm:ss"
): string {
  return format(date, dateFormat);
}
