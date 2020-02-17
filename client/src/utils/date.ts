import { format, parseISO } from 'date-fns';

export function formatDate(
  date: Date | string,
  dateFormat: string = 'yyyy-MM-dd'
): string {
  return format(date instanceof Date ? date : parseISO(date), dateFormat);
}

export function formatDateTime(
  date: Date | string,
  dateFormat: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return format(date instanceof Date ? date : parseISO(date), dateFormat);
}

export function formatTime(
  date: Date | string,
  dateFormat: string = 'HH:mm:ss'
): string {
  return format(date instanceof Date ? date : parseISO(date), dateFormat);
}