import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

const variants = {
  primary: { bg: '#22C55E', text: '#FFFFFF' },
  secondary: { bg: '#0EA5E9', text: '#FFFFFF' },
  outline: { bg: 'transparent', text: '#22C55E', border: '#22C55E' },
  ghost: { bg: 'transparent', text: '#22C55E' },
  danger: { bg: '#EF4444', text: '#FFFFFF' },
};

const sizes = {
  xs: { h: 28, px: 12, fs: 12 },
  sm: { h: 36, px: 16, fs: 14 },
  md: { h: 48, px: 24, fs: 16 },
  lg: { h: 56, px: 32, fs: 18 },
};

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', fullWidth, loading, disabled, onPress, leftIcon, style, ...rest
}) => {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.btn,
        { height: s.h, paddingHorizontal: s.px, backgroundColor: v.bg },
        v.border && { borderWidth: 2, borderColor: v.border },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {leftIcon}
          {leftIcon && <View style={{ width: 6 }} />}
          <Text style={{ color: v.text, fontSize: s.fs, fontWeight: '600' }}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
});
