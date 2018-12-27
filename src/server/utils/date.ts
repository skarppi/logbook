import { differenceInMilliseconds } from "date-fns";

function leftPad(num: number): string {
  return ("00" + Math.floor(num)).slice(-2);
}

export function duration(from: Date, to?: Date): number {
  return to ? differenceInMilliseconds(to, from) : 0;
}

export function formatDuration(milliseconds: number): string {
  const seconds = leftPad((milliseconds / 1000) % 60);
  const minutes = leftPad(milliseconds / 60000);
  return `${minutes}m ${seconds}s ${milliseconds % 1000}ms`;
}
