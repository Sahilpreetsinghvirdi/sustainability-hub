// mobile/src/components/common/Input.tsx
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'decimal' | 'phone';
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCompleteType?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  testID?: string;
}

export const Input = React.forwardRef<any, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      onBlur,
      error,
      helperText,
      disabled = false,
      required = false,
      type = 'text',
      multiline = false,
      numberOfLines,
      leftIcon,
      rightIcon,
      secureTextEntry = false,
      style,
      inputStyle,
      labelStyle,
      autoCapitalize = 'sentences',
      autoCompleteType,
      keyboardType,
      returnKeyType = 'done',
      onSubmitEditing,
      testID,
    },
    ref
  ) => {
    const isError = !!error;
    const isFocused = false; // Would need useState for focus tracking

    const getKeyboardType = () => {
      if (keyboardType) return keyboardType;
      switch (type) {
        case 'email':
          return 'email-address';
        case 'number':
          return 'numeric';
        case 'decimal':
          return 'decimal-pad';
        case 'phone':
          return 'phone-pad';
        default:
          return 'default';
      }
    };

    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={[styles.label, labelStyle, required && styles.labelRequired]}>
            {label}
            {required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
        )}
        <View
          style={[
            styles.inputWrapper,
            isError && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            editable={!disabled}
            secureTextEntry={secureTextEntry && type === 'password'}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCapitalize={autoCapitalize}
            autoComplete={autoCompleteType as any}
            keyboardType={getKeyboardType()}
            returnKeyType={returnKeyType}
            style={[
              styles.input,
              inputStyle,
              multiline ? styles.inputMultiline : undefined,
              leftIcon ? styles.inputWithLeftIcon : undefined,
              rightIcon ? styles.inputWithRightIcon : undefined,
            ]}
            testID={testID}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{ disabled }}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {isError && <Text style={styles.errorText}>{error}</Text>}
        {!isError && helperText && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelRequired: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredAsterisk: {
    color: colors.error,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: colors.background.secondary,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
});