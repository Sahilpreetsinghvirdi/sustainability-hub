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
        grid: '#23232C',
        axis: '#9A9AA6',
        tooltipBg: '#1D1D26',
        tooltipBorder: '#34343F',
        tooltipText: '#E3E3EA',
        surface: '#14141B',
        legend: '#9A9AA6',
        fallback: '#52525E',
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
