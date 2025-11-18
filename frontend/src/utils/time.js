// Shared time utilities for frontend components.
// Provides business timezone constants and helpers for formatting and comparisons.
export const BUSINESS_TZ = 'Asia/Kolkata';

// Returns { date, time } formatted in business timezone
export function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return {
    date: date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: BUSINESS_TZ,
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: BUSINESS_TZ,
    }),
  };
}

// Business-local YYYY-MM-DD for date inputs
export function businessTodayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TZ }).format(new Date());
}

// Business-local HH:MM in 24h format
export function businessNowHM() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

// Hours until a future datetime (negative if past)
export function hoursUntil(dateTimeString) {
  return (new Date(dateTimeString).getTime() - Date.now()) / (1000 * 60 * 60);
}