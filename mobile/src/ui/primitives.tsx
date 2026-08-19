// mobile/src/ui/primitives.tsx
import React from 'react';
import { View, Text as RNText, ViewProps, TextProps as RNTextProps, StyleSheet } from 'react-native';

export type StackProps = ViewProps & {
  children?: React.ReactNode;
  gap?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  align?: ViewProps['style'] extends infer S ? S extends object ? S['alignItems'] : never : never;
  justify?: ViewProps['style'] extends infer S ? S extends object ? S['justifyContent'] : never : never;
  direction?: 'row' | 'column';
  flex?: number;
  wrap?: boolean;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  bg?: string;
  backgroundColor?: string;
  borderRadius?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  opacity?: number;
};

export function Stack({ children, style, ...props }: StackProps) {
  const { gap, padding, paddingHorizontal, paddingVertical, paddingTop, paddingBottom, paddingLeft, paddingRight,
    margin, marginHorizontal, marginVertical, marginTop, marginBottom,
    align, justify, direction, flex, wrap, width, height, minWidth, minHeight, maxWidth, maxHeight,
    bg, backgroundColor, borderRadius, overflow, opacity, ...rest } = props;
  return (
    <View style={[
      gap != null && { gap },
      padding != null && { padding },
      paddingHorizontal != null && { paddingHorizontal },
      paddingVertical != null && { paddingVertical },
      paddingTop != null && { paddingTop },
      paddingBottom != null && { paddingBottom },
      paddingLeft != null && { paddingLeft },
      paddingRight != null && { paddingRight },
      margin != null && { margin },
      marginHorizontal != null && { marginHorizontal },
      marginVertical != null && { marginVertical },
      marginTop != null && { marginTop },
      marginBottom != null && { marginBottom },
      align != null && { alignItems: align },
      justify != null && { justifyContent: justify },
      direction && { flexDirection: direction },
      flex != null && { flex },
      wrap && { flexWrap: 'wrap' },
      width != null && { width },
      height != null && { height },
      minWidth != null && { minWidth },
      minHeight != null && { minHeight },
      maxWidth != null && { maxWidth },
      maxHeight != null && { maxHeight },
      bg != null && { backgroundColor: bg },
      backgroundColor != null && { backgroundColor },
      borderRadius != null && { borderRadius },
      overflow && { overflow },
      opacity != null && { opacity },
      style,
    ]} {...rest}>
      {children}
    </View>
  );
}

export type TextProps = RNTextProps & {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  numberOfLines?: number;
};

export function Text({ style, fontSize, fontWeight, color, textAlign, lineHeight, letterSpacing, textDecorationLine, numberOfLines, ...props }: TextProps) {
  return (
    <RNText style={[
      { color: '#FFFFFF' },
      fontSize != null && { fontSize },
      fontWeight && { fontWeight },
      color != null && { color },
      textAlign && { textAlign },
      lineHeight != null && { lineHeight },
      letterSpacing != null && { letterSpacing },
      textDecorationLine && { textDecorationLine },
      style,
    ]} numberOfLines={numberOfLines} {...props}>
      {props.children}
    </RNText>
  );
}
