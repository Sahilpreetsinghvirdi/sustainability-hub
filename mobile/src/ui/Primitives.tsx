import React from 'react';
import { View, Text as RNText } from 'react-native';
import { borderRadius, spacing } from '@/constants/theme';

const radiusMap: Record<string, number> = { none: 0, sm: borderRadius.sm, md: borderRadius.md, lg: borderRadius.lg, xl: borderRadius.xl, '2xl': 28, '3xl': 34, full: borderRadius.full };
const spacingMap: Record<string, number> = { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, xs: spacing.xs, sm: spacing.sm, md: spacing.md, lg: spacing.lg, xl: spacing.xl, xxl: spacing.xxl };
const styleKeys = new Set(['flex', 'flexDirection', 'flexWrap', 'flexShrink', 'flexGrow', 'flexBasis', 'alignItems', 'alignSelf', 'alignContent', 'justifyContent', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical', 'gap', 'rowGap', 'columnGap', 'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderWidth', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'backgroundColor', 'opacity', 'overflow', 'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation', 'display']);
const textKeys = new Set(['fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 'textAlign', 'textDecorationLine', 'textDecorationStyle', 'textDecorationColor', 'textTransform', 'letterSpacing', 'lineHeight', 'textShadowColor', 'textShadowOffset', 'textShadowRadius']);

function extractStyle(props: Record<string, any>) {
  const style: Record<string, any> = {};
  const rest: Record<string, any> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'children' || key === 'style' || key === 'key' || key.startsWith('on')) rest[key] = value;
    else if (styleKeys.has(key) || textKeys.has(key)) style[key] = value;
    else rest[key] = value;
  });
  return [style, rest] as const;
}

function resolveStyle(raw: Record<string, any>) {
  const output: Record<string, any> = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === 'string' && key.toLowerCase().includes('radius') && radiusMap[value] !== undefined) output[key] = radiusMap[value];
    else if (typeof value === 'string' && (key.toLowerCase().includes('margin') || key.toLowerCase().includes('padding') || key.toLowerCase().includes('gap')) && spacingMap[value] !== undefined) output[key] = spacingMap[value];
    else if (key === 'fontSize' && typeof value === 'string' && /^\d+$/.test(value)) output[key] = Number(value);
    else output[key] = value;
  });
  return output;
}

interface PrimitiveProps { children?: React.ReactNode; style?: any; [key: string]: any }

export const Stack: React.FC<PrimitiveProps> = ({ children, style: styleProp, ...props }) => {
  const [extracted] = extractStyle(props);
  return <View style={[resolveStyle(extracted), styleProp]}>{children}</View>;
};

export const Text: React.FC<PrimitiveProps> = ({ children, style: styleProp, ...props }) => {
  const [extracted] = extractStyle(props);
  return <RNText style={[resolveStyle(extracted), styleProp]}>{children}</RNText>;
};

export const XStack: React.FC<PrimitiveProps> = props => <Stack {...props} flexDirection="row" />;
export const YStack: React.FC<PrimitiveProps> = props => <Stack {...props} />;
