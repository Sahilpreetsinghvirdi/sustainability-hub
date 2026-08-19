import React from 'react';
import { TextInput, Text, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

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

export const Input: React.FC<InputProps> = ({ label, placeholder, value, onChangeText, secureTextEntry, error, containerStyle, style, leftIcon, rightComponent, ...rest }) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && { paddingLeft: 40 }, rightComponent && { paddingRight: 40 }, error && styles.inputError, style]}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
        />
        {rightComponent && <View style={styles.iconRight}>{rightComponent}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
  },
  inputError: { borderColor: '#EF4444' },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  iconLeft: { position: 'absolute', left: 12, zIndex: 1 },
  iconRight: { position: 'absolute', right: 12, zIndex: 1 },
});
