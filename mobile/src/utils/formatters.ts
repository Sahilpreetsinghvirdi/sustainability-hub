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
    meat_beef: '#DC2626',
    meat_pork: '#EF4444',
    meat_poultry: '#F97316',
    meat_lamb: '#B91C1C',
    seafood: '#0EA5E9',
    dairy_milk: '#F59E0B',
    dairy_cheese: '#FBBF24',
    eggs: '#FDE047',
    produce_fruit: '#22C55E',
    produce_vegetable: '#16A34A',
    grains_bread: '#84CC16',
    grains_pasta: '#65A30D',
    grains_rice: '#4D7C0F',
    beverages_alcoholic: '#8B5CF6',
    beverages_nonalcoholic: '#06B6D4',
    transport_fuel: '#64748B',
    other: '#94A3B8',
  };
  return colors[category] || '#94A3B8';
}

export function getMealColor(mealType: string): string {
  const colors: Record<string, string> = {
    breakfast: '#F59E0B',
    lunch: '#EF4444',
    dinner: '#8B5CF6',
    snack: '#EC4899',
  };
  return colors[mealType] || '#94A3B8';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    completed: '#22C55E',
    failed: '#EF4444',
  };
  return colors[status] || '#94A3B8';
}