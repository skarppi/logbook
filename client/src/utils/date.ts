import { format } from 'date-fns';

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