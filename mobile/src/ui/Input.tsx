// mobile/src/ui/Input.tsx
import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { Stack, Text } from 'tamagui';

export type InputProps = {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  type?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: any;
  style?: any;
};

export function Input({ label, error, placeholder, value, onChangeText, secureTextEntry, multiline, numberOfLines, leftIcon, helperText, containerStyle, style }: InputProps) {
  return (
    <Stack style={containerStyle}>
      {label && <Text color="#94A3B8" fontSize={14} marginBottom={6} fontWeight="500">{label}</Text>}
      <Stack flexDirection="row" alignItems="center" backgroundColor="#0F172A" borderWidth={1} borderColor={error ? '#EF4444' : '#334155'} borderRadius={10}>
        {leftIcon && <Stack paddingLeft={12}>{leftIcon}</Stack>}
        <RNTextInput
          style={[{ flex: 1, color: '#FFFFFF', fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 }, style]}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </Stack>
      {error && <Text color="#EF4444" fontSize={12} marginTop={4}>{error}</Text>}
      {helperText && !error && <Text color="#64748B" fontSize={12} marginTop={4}>{helperText}</Text>}
    </Stack>
  );
}
