export function formatTime(iso, tz = 'UTC') {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
}