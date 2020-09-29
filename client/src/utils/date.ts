import { format, parseISO } from 'date-fns';

export function formatDate(
  dateOrStr: Date | string,
  dateFormat: string = 'yyyy-MM-dd'
): string {
  if (!dateOrStr) {
    return;
  }
  const date = dateOrStr instanceof Date ? dateOrStr : parseISO(dateOrStr);
  return format(date, dateFormat);
}

export function formatDateTimeLong(
  date: Date | string,
  dateFormat: string = 'EEEE dd MMMM'
): string {
  return formatDate(date, dateFormat);
}

export function formatDateTimeLocal(
  date: Date | string,
  dateFormat: string = 'yyyy-MM-dd\'T\'HH:mm'
): string {
  return formatDate(date, dateFormat);
}

export function formatDateTime(
  date: Date | string,
  dateFormat: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return formatDate(date, dateFormat);
}

export function formatTime(
  date: Date | string,
  dateFormat: string = 'HH:mm:ss'
): string {
  return formatDate(date, dateFormat);
}

export function formatMonth(
  date: Date | string,
  dateFormat: string = 'yyyy MMMM'
): string {
  return formatDate(date, dateFormat);
}