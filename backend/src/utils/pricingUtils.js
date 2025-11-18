export function isPeak(date, tz = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: 'numeric',
    hour12: false
  }).formatToParts(date);
  const weekdayStr = parts.find(p => p.type === 'weekday')?.value || 'Sun';
  const hour = Number(parts.find(p => p.type === 'hour')?.value || '0');
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = dayMap[weekdayStr] ?? 0;
  const isWeekday = day >= 1 && day <= 5;
  // Peak windows per business rules: Mon–Fri
  // Morning: 10:00–12:59 (hours 10,11,12)
  // Evening: 16:00–18:59 (hours 16,17,18)
  const inMorningPeak = hour >= 10 && hour < 13; // 10:00–12:59
  const inEveningPeak = hour >= 16 && hour < 19; // 16:00–18:59
  return isWeekday && (inMorningPeak || inEveningPeak);
}

export function computeDynamicPrice(start, end, baseRate, tz = "UTC") {
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);

  let total = 0;
  const oneMinute = 60 * 1000;

  const endTime = e.getTime();

  for (let t = s.getTime(); t < endTime; t += oneMinute) {
    const d = new Date(t);
    const isPeakHour = isPeak(d, tz);
    const ratePerMinute = (isPeakHour ? baseRate * 1.5 : baseRate) / 60;
    total += ratePerMinute;
  }

  return Math.round(total * 100) / 100;
}