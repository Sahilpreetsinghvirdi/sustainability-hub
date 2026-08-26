import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  containerStyle?: any;
  style?: any;
  leftIcon?: React.ReactNode;
  rightComponent?: React.ReactNode;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({ label, placeholder, value, onChangeText, secureTextEntry, error, containerStyle, style, leftIcon, rightComponent }) => (
  <View style={containerStyle}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.inputRow}>
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      <TextInput
        style={[styles.input, leftIcon && styles.inputWithLeftIcon, rightComponent && styles.inputWithRightIcon, error && styles.inputError, style]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      {rightComponent && <View style={styles.iconRight}>{rightComponent}</View>}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  label: { color: colors.text.secondary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.light, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text.primary, fontSize: typography.fontSize.md },
  inputWithLeftIcon: { paddingLeft: 42 },
  inputWithRightIcon: { paddingRight: 42 },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: typography.fontSize.xs, marginTop: spacing.xs },
  iconLeft: { position: 'absolute', left: spacing.md, zIndex: 1 },
  iconRight: { position: 'absolute', right: spacing.md, zIndex: 1 },
});
