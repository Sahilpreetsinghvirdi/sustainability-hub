import React from 'react';
import { View, Text as RNText, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

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

const textOnlyKeys = new Set([
  'fontSize', 'fontWeight', 'fontFamily', 'fontStyle',
  'color', 'textAlign', 'textDecorationLine', 'textDecorationStyle',
  'textDecorationColor', 'textTransform', 'letterSpacing', 'lineHeight',
  'textShadowColor', 'textShadowOffset', 'textShadowRadius',
]);

function extractStyle(props: Record<string, any>): [Record<string, any>, Record<string, any>] {
  const style: Record<string, any> = {};
  const rest: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === 'children' || key === 'style' || key === 'key' || key.startsWith('on')) {
      rest[key] = val;
    } else if (styleKeys.has(key) || textOnlyKeys.has(key)) {
      style[key] = val;
    } else {
      rest[key] = val;
    }
  }
  return [style, rest];
}

const borderRadiusMap: Record<string, number> = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, '3xl': 32, full: 9999,
};

function resolveStyle(raw: Record<string, any>): ViewStyle | TextStyle {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' && (k.toLowerCase().includes('radius') || k.toLowerCase().includes('border')) && borderRadiusMap[v] !== undefined) {
      out[k] = borderRadiusMap[v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

interface StackProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
}

export const Stack: React.FC<StackProps> = ({ children, style: styleProp, ...props }) => {
  const [extracted, rest] = extractStyle(props);
  const resolved = resolveStyle(extracted);
  return <View style={[resolved, styleProp]}>{children}</View>;
};

interface TextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  [key: string]: any;
}

export const Text: React.FC<TextProps> = ({ children, style: styleProp, ...props }) => {
  const [extracted, rest] = extractStyle(props);
  const resolved = resolveStyle(extracted);
  return <RNText style={[resolved, styleProp]}>{children}</RNText>;
};

export const XStack: React.FC<StackProps> = (props) => <Stack {...props} />;
export const YStack: React.FC<StackProps> = (props) => <Stack {...props} />;
