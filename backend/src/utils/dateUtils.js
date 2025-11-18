// Parse an ISO-8601 string into a Date object; throws if the input is invalid
// example output: Date 2023-10-15T00:00:00.000Z
export function parseISO(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return d;
}

// Compute the signed offset (in minutes) between UTC and the given timezone
// for the specified calendar date (y, m, d) at midnight in that timezone.
// Positive values mean the local time is ahead of UTC; negative behind.
function computeSignedOffsetMinutes(y, m, d, tz) {
  // Build UTC midnight for the supplied calendar date
  const utcMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

  // Decompose that instant into the timezone's local calendar fields
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(utcMidnight);

  // Extract local calendar values (fallback to input if missing)
  const yLocal = Number(parts.find(p => p.type === 'year')?.value || y);
  const mLocal = Number(parts.find(p => p.type === 'month')?.value || m);
  const dLocal = Number(parts.find(p => p.type === 'day')?.value || d);
  const hLocal = Number(parts.find(p => p.type === 'hour')?.value || 0);
  const minLocal = Number(parts.find(p => p.type === 'minute')?.value || 0);

  // Determine how many days the local calendar is shifted relative to UTC
  const dayMs = 24 * 60 * 60 * 1000;
  const offsetDays = Math.round((Date.UTC(yLocal, mLocal - 1, dLocal) - Date.UTC(y, m - 1, d)) / dayMs);

  // Convert the total shift into minutes
  return offsetDays * 1440 + hLocal * 60 + minLocal;
}

// Return the ISO-8601 string for the start of the given calendar day in the specified timezone
export function startOfDayISO(dateStr, tz = 'UTC') {
  const d = parseISO(dateStr);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  // Compute how far UTC needs to shift to hit midnight in the target timezone
  const signedOffsetMin = computeSignedOffsetMinutes(y, m, day, tz);

  // Move UTC to that instant and stringify
  const utcMs = Date.UTC(y, m - 1, day, 0, 0, 0) - signedOffsetMin * 60000;
  return new Date(utcMs).toISOString();
}

// Return the ISO-8601 string for the instant just before the next day starts in the specified timezone
export function endOfDayISO(dateStr, tz = 'UTC') {
  const d = parseISO(dateStr);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  // Same offset calculation as startOfDayISO, but target the last millisecond of the day
  const signedOffsetMin = computeSignedOffsetMinutes(y, m, day, tz);
  const utcMs = Date.UTC(y, m - 1, day + 1, 0, 0, 0) - signedOffsetMin * 60000 - 1;
  return new Date(utcMs).toISOString();
}