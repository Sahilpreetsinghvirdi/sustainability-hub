// mobile/src/ui/Input.tsx
import { styled, TextInput, Stack, Text } from '@tamagui/core';

export const InputFrame = styled(Stack, {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '$backgroundStrong',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$md',
  paddingHorizontal: '$4',
  variants: {
    hasError: { true: { borderColor: '$error', borderWidth: 2 } },
    disabled: { true: { opacity: 0.6, backgroundColor: '$backgroundHover' } },
    focused: { true: { borderColor: '$borderFocus', borderWidth: 2 } },
  },
}) as typeof Stack;

export const InputLabel = styled(Text, {
  fontSize: '$2',
  fontWeight: '500',
  color: '$color',
  marginBottom: '$1',
  variants: { required: { true: { color: '$error' } } },
}) as typeof Text;

export const InputField = styled(TextInput, {
  flex: 1,
  fontSize: '$3',
  color: '$color',
  paddingVertical: '$3',
  minHeight: 48,
  variants: {
    multiline: { true: { minHeight: 100, paddingTop: '$4', paddingBottom: '$4', textAlignVertical: 'top' } },
    withLeftIcon: { true: { paddingLeft: 0 } },
    withRightIcon: { true: { paddingRight: 0 } },
  },
}) as typeof TextInput;

export const InputHelper = styled(Text, {
  fontSize: '$1',
  marginTop: '$1',
  marginLeft: '$1',
  variants: { error: { true: { color: '$error' }, false: { color: '$colorFocus' } } },
}) as typeof Text;

export const InputIcon = styled(Stack, { marginHorizontal: '$2' }) as typeof Stack;

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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCompleteType?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  testID?: string;
}