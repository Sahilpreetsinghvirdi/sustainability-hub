// mobile/src/ui/ProgressBar.tsx
import React from 'react';
import { Stack, Text } from 'tamagui';

export type ProgressBarProps = {
  progress: number;
  color?: string;
  variant?: string;
  size?: string;
  showLabel?: boolean;
  label?: string;
  style?: any;
};

export function ProgressBar({ progress, color = '#2563EB', variant, size = 'md', showLabel, label, style }: ProgressBarProps) {
  const height = size === 'lg' ? 12 : 8;
  const variantColors: Record<string, string> = {
    default: '#2563EB',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  };
  const barColor = variant && variantColors[variant] ? variantColors[variant] : color;

  return (
    <Stack style={style}>
      {showLabel && label && (
        <Stack flexDirection="row" justifyContent="space-between" marginBottom={4}>
          <Text color="#94A3B8" fontSize={12}>{label}</Text>
          <Text color="#94A3B8" fontSize={12}>{Math.round(progress)}%</Text>
        </Stack>
      )}
      <Stack backgroundColor="#1E293B" borderRadius={100} overflow="hidden" height={height}>
        <Stack backgroundColor={barColor} borderRadius={100} width={`${Math.min(100, Math.max(0, progress))}%`} height={height} />
      </Stack>
    </Stack>
  );
}
