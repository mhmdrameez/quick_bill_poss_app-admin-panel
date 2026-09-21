// lib/dates.ts
import { TimeRange } from './types';

export function getStartOfDay(timestamp: number | Date = new Date()): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getEndOfDay(timestamp: number | Date = new Date()): number {
  const d = new Date(timestamp);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function getDateRangeTimestamps(
  range: TimeRange,
  customStart?: string | number,
  customEnd?: string | number
): { startTime: number; endTime: number } {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);

  switch (range) {
    case 'today':
      return { startTime: todayStart, endTime: todayEnd };

    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        startTime: getStartOfDay(yesterday),
        endTime: getEndOfDay(yesterday),
      };
    }

    case '7d': {
      const start7d = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      return {
        startTime: getStartOfDay(start7d),
        endTime: todayEnd,
      };
    }

    case '30d': {
      const start30d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      return {
        startTime: getStartOfDay(start30d),
        endTime: todayEnd,
      };
    }

    case 'custom': {
      const start = customStart ? new Date(customStart).getTime() : todayStart;
      const end = customEnd ? getEndOfDay(new Date(customEnd)) : todayEnd;
      return {
        startTime: isNaN(start) ? todayStart : start,
        endTime: isNaN(end) ? todayEnd : end,
      };
    }

    default:
      return { startTime: todayStart, endTime: todayEnd };
  }
}

export function formatDate(timestamp: number | undefined | null): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(timestamp: number | undefined | null): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTime(timestamp: number | undefined | null): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(timestamp: number | undefined | null): string {
  if (!timestamp) return '—';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(timestamp);
}
