export function daysBetween(from: string, to: string): number {
  return Math.round((Date.UTC(+to.slice(0,4), +to.slice(5,7)-1, +to.slice(8,10)) - Date.UTC(+from.slice(0,4), +from.slice(5,7)-1, +from.slice(8,10))) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const d = new Date(Date.UTC(+date.slice(0,4), +date.slice(5,7)-1, +date.slice(8,10)));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function hoursBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 3_600_000;
}

export function toIsoDate(dt: string): string {
  return dt.slice(0, 10);
}
