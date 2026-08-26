import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children }) => (
  <RNModal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.header}>{title && <Text style={styles.title}>{title}</Text>}<TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity></View>
        {children}
      </View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 420, backgroundColor: colors.background.elevated, borderRadius: borderRadius.xl, padding: spacing.lg, ...shadows.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  closeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.background.tertiary },
  close: { color: colors.text.tertiary, fontSize: 15 },
});
