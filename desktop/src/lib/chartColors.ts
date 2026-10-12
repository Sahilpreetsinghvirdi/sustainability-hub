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
        grid: '#1E2A24',
        axis: '#7D9C8C',
        tooltipBg: '#131D18',
        tooltipBorder: '#2A3B32',
        tooltipText: '#E9F5EE',
        surface: '#121B16',
        legend: '#7D9C8C',
        fallback: '#4A5F54',
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
