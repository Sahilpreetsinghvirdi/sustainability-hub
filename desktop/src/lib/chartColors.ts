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
        grid: '#DDE7E1',
        axis: '#5F7A6B',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#D3E0D7',
        tooltipText: '#0C1A12',
        surface: '#FFFFFF',
        legend: '#5F7A6B',
        fallback: '#8AA395',
      };
}
