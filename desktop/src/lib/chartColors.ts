import { useTheme } from '@/lib/theme';

export interface ChartChrome {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  surface: string;
  legend: string;
  fallback: string;
}

/** Theme-aware chrome colors for recharts (grids, axes, tooltips, strokes). */
export function useChartChrome(): ChartChrome {
  const isDark = useTheme() === 'dark';
  return isDark
    ? {
        grid: '#2F2F37',
        axis: '#A1A1AA',
        tooltipBg: '#17171C',
        tooltipBorder: '#3F3F4A',
        tooltipText: '#E9E9ED',
        surface: '#0D0D11',
        legend: '#A1A1AA',
        fallback: '#52525B',
      }
    : {
        grid: '#E5E5E4',
        axis: '#737373',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#DADADA',
        tooltipText: '#0A0A0A',
        surface: '#FFFFFF',
        legend: '#6B6B6B',
        fallback: '#737373',
      };
}
