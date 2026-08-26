// mobile/src/utils/formatters.ts
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

export function formatWeight(kg: number, units: 'metric' | 'imperial' = 'metric'): string {
  if (units === 'imperial') {
    const lbs = kg * 2.20462;
    if (lbs >= 1) {
      return `${lbs.toFixed(1)} lbs`;
    }
    const oz = lbs * 16;
    return `${oz.toFixed(1)} oz`;
  }
  if (kg >= 1) {
    return `${kg.toFixed(1)} kg`;
  }
  const g = kg * 1000;
  return `${g.toFixed(0)} g`;
}

export function formatEnergy(kwh: number): string {
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(1)} MWh`;
  }
  return `${kwh.toFixed(1)} kWh`;
}

export function formatCarbon(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t CO₂e`;
  }
  return `${kg.toFixed(1)} kg CO₂e`;
}

export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), pattern);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatPercentage(value: number, total: number, decimals = 0): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

export function formatTrend(current: number, previous: number): { value: string; isPositive: boolean } {
  if (previous === 0) return { value: '0%', isPositive: true };
  const change = ((current - previous) / previous) * 100;
  const prefix = change >= 0 ? '▲' : '▼';
  return { value: `${prefix} ${Math.abs(change).toFixed(1)}%`, isPositive: change <= 0 };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(capitalizeFirst)
    .join(' ');
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    meat_beef: '#262626',
    meat_pork: '#262626',
    meat_poultry: '#444444',
    meat_lamb: '#262626',
    seafood: '#444444',
    dairy_milk: '#444444',
    dairy_cheese: '#6B6B6B',
    eggs: '#9A9A9A',
    produce_fruit: '#444444',
    produce_vegetable: '#1C1C1C',
    grains_bread: '#6B6B6B',
    grains_pasta: '#444444',
    grains_rice: '#262626',
    beverages_alcoholic: '#444444',
    beverages_nonalcoholic: '#6B6B6B',
    transport_fuel: '#6B6B6B',
    other: '#9A9A9A',
  };
  return colors[category] || '#9A9A9A';
}

export function getMealColor(mealType: string): string {
  const colors: Record<string, string> = {
    breakfast: '#444444',
    lunch: '#262626',
    dinner: '#444444',
    snack: '#6B6B6B',
  };
  return colors[mealType] || '#9A9A9A';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#444444',
    processing: '#444444',
    completed: '#444444',
    failed: '#262626',
  };
  return colors[status] || '#9A9A9A';
}
