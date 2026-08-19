import React from 'react';
import { View, StyleSheet } from 'react-native';

const borderRadiusMap: Record<string, number> = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, '3xl': 32, full: 9999,
};

const styleKeys = new Set([
  'flex', 'flexDirection', 'flexWrap', 'flexShrink', 'flexGrow', 'flexBasis',
  'alignItems', 'alignSelf', 'alignContent', 'justifyContent',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'paddingHorizontal', 'paddingVertical',
  'gap', 'rowGap', 'columnGap',
  'position', 'top', 'bottom', 'left', 'right', 'zIndex',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'borderWidth', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
  'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
  'backgroundColor', 'opacity', 'overflow',
  'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation',
  'display',
]);

interface CardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  style?: any;
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', style: styleProp, ...props }) => {
  const extracted: Record<string, any> = {};
  for (const [k, v] of Object.entries(props)) {
    if (styleKeys.has(k)) {
      if (typeof v === 'string' && borderRadiusMap[v] !== undefined) {
        extracted[k] = borderRadiusMap[v];
      } else {
        extracted[k] = v;
      }
    }
  }
  return (
    <View style={[styles.card, variantStyles[variant], extracted, styleProp]}>
      {children}
    </View>
  );
};

const variantStyles = {
  default: {},
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  outlined: { borderWidth: 2, borderColor: '#475569', backgroundColor: 'transparent' },
  filled: { backgroundColor: '#0F172A', borderWidth: 0 },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
  },
});
