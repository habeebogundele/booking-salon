/** Salon operating schedule — edit here to control open days and time slots. */

/** Every 60 minutes, 9:00 AM – 5:00 PM (salon hours 9am–6pm). */
export const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/** 0 = Sunday, 1 = Monday, … 6 = Saturday. Salon is closed on these days. */
export const CLOSED_DAYS: number[] = [0]; // closed Sundays

export function isDateOpen(dateStr: string): boolean {
  const date = new Date(`${dateStr}T12:00:00`);
  return !CLOSED_DAYS.includes(date.getDay());
}

export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${dateStr}T00:00:00`);
  return selected < today;
}

export function getDayName(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
  });
}
