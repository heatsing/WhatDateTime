// Calendar inputs are wall dates, not UTC instants. Avoid Date's 0–99 → 1900 rule.
export function calendarDate(year: number, month: number, day = 1): Date {
  if (![year, month, day].every(Number.isInteger) || year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return new Date(NaN);
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : new Date(NaN);
}

export function parseCalendarDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(NaN);
  const [year, month, day] = value.split("-").map(Number);
  return calendarDate(year, month, day);
}

// Same visible calendar fields on server and the first browser render, in any zone.
export function snapshotCalendarDate(initialTime: string): Date {
  return parseCalendarDate(new Date(initialTime).toISOString().slice(0, 10));
}
