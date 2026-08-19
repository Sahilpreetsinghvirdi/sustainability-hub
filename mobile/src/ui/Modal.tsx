// mobile/src/ui/Modal.tsx
import React from 'react';
import { Modal as RNModal, StyleSheet } from 'react-native';
import { Stack, Text } from 'tamagui';

export type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: string;
  style?: any;
};

export function Modal({ visible, onClose, title, children, style }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <Stack flex={1} backgroundColor="rgba(0,0,0,0.6)" justifyContent="center" alignItems="center" padding={20}>
        <Stack backgroundColor="#1E293B" borderRadius={16} padding={24} width="100%" maxWidth={400} style={style}>
          {title && <Text color="#FFFFFF" fontSize={18} fontWeight="700" marginBottom={16}>{title}</Text>}
          {children}
          {onClose && (
            <Stack marginTop={16} alignItems="flex-end" onPress={onClose}>
              <Text color="#60A5FA" fontSize={14} fontWeight="600">Close</Text>
            </Stack>
          )}
        </Stack>
      </Stack>
    </RNModal>
  );
}
