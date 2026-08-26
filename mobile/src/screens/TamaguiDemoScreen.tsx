// mobile/src/screens/TamaguiDemoScreen.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack, Text, Button, Card, Input, ProgressBar, Badge, Avatar, Modal, Sparkline, BarChart, PieChart } from '@/ui';
import { colors, spacing } from '@/constants/theme';

export const TamaguiDemoScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(45);

  const barData = [
    { label: 'Mon', value: 45, color: colors.primary[500] },
    { label: 'Tue', value: 52, color: colors.secondary[500] },
    { label: 'Wed', value: 38, color: colors.warning },
    { label: 'Thu', value: 61, color: colors.success },
    { label: 'Fri', value: 55, color: colors.primary[500] },
    { label: 'Sat', value: 67, color: colors.secondary[500] },
    { label: 'Sun', value: 43, color: colors.error },
  ];
  const pieData = [
    { label: 'Carbon', value: 187, color: colors.primary[500] },
    { label: 'Energy', value: 120, color: colors.secondary[500] },
    { label: 'Waste', value: 45, color: colors.error },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={spacing.lg}>
        <Stack>
          <Text fontSize={24} fontWeight="800" color="#F2F8F3">Component Demo</Text>
          <Text fontSize={14} color="#8EAA99" marginTop={4}>All UI components</Text>
        </Stack>
        <Avatar size={48} name="Demo" />
      </Stack>

      <Section title="Buttons">
        <Stack flexDirection="row" flexWrap="wrap" gap={8} marginBottom={8}>
          <Button variant="primary" size="sm">Primary</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
          <Button variant="danger" size="sm">Danger</Button>
        </Stack>
        <Stack flexDirection="row" flexWrap="wrap" gap={8} marginBottom={8}>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </Stack>
        <Button variant="primary" fullWidth>Full Width</Button>
        <Button variant="primary" loading style={{ marginTop: 8 }}>Loading...</Button>
      </Section>

      <Section title="Cards">
        <Card marginBottom={8}>
          <Text fontSize={16} fontWeight="600" color="#F2F8F3" marginBottom={4}>Default Card</Text>
          <Text fontSize={14} color="#C4D8CB">Content with default styling</Text>
        </Card>
        <Card marginBottom={8}>
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text fontSize={16} fontWeight="600" color="#F2F8F3">With Badge</Text>
            <Badge variant="success">New</Badge>
          </Stack>
        </Card>
      </Section>

      <Section title="Inputs">
        <Input label="Email" placeholder="you@example.com" value={inputValue} onChangeText={setInputValue} />
        <Input label="Password" placeholder="Password" value="" onChangeText={() => {}} secureTextEntry error="Min 8 characters" containerStyle={{ marginTop: 12 }} />
      </Section>

      <Section title="Progress Bars">
        <ProgressBar progress={25} color={colors.primary[500]} />
        <ProgressBar progress={60} color={colors.success} style={{ marginTop: 8 }} />
        <ProgressBar progress={90} color={colors.warning} style={{ marginTop: 8 }} />
        <ProgressBar progress={progress} color={colors.info} showLabel label="Interactive" style={{ marginTop: 8 }} />
        <Stack flexDirection="row" gap={8} marginTop={8}>
          <Button variant="ghost" size="sm" onPress={() => setProgress(Math.max(0, progress - 10))}>- 10</Button>
          <Button variant="ghost" size="sm" onPress={() => setProgress(Math.min(100, progress + 10))}>+ 10</Button>
        </Stack>
      </Section>

      <Section title="Badges">
        <Stack flexDirection="row" flexWrap="wrap" gap={8} marginBottom={8}>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </Stack>
      </Section>

      <Section title="Avatars">
        <Stack flexDirection="row" alignItems="center" gap={8} marginBottom={8}>
          <Avatar size={24} name="A" />
          <Avatar size={32} name="AB" />
          <Avatar size={40} name="ABC" />
          <Avatar size={56} name="ABCD" status="online" />
        </Stack>
        <Stack flexDirection="row" alignItems="center" gap={8}>
          <Avatar size={40} name="Online" status="online" />
          <Avatar size={40} name="Busy" status="busy" />
          <Avatar size={40} name="Away" status="away" />
          <Avatar size={40} name="Offline" status="offline" />
        </Stack>
      </Section>

      <Section title="Charts">
        <Text fontSize={14} fontWeight="600" color="#F2F8F3" marginBottom={8}>Sparkline</Text>
        <Sparkline data={[10, 15, 13, 17, 22, 20, 25, 28, 24, 30]} color={colors.primary[500]} width={300} height={80} />
        <Text fontSize={14} fontWeight="600" color="#F2F8F3" marginTop={16} marginBottom={8}>Bar Chart</Text>
        <BarChart data={barData} height={180} />
        <Text fontSize={14} fontWeight="600" color="#F2F8F3" marginTop={16} marginBottom={8}>Pie Chart</Text>
        <PieChart data={pieData} size={180} />
      </Section>

      <Section title="Modal">
        <Button variant="primary" onPress={() => setModalVisible(true)}>Open Modal</Button>
        <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Demo Modal">
          <Text color="#C4D8CB" marginBottom={12}>This is a modal dialog.</Text>
          <ProgressBar progress={75} color={colors.success} />
          <Button variant="primary" fullWidth onPress={() => setModalVisible(false)} style={{ marginTop: 16 }}>Close</Button>
        </Modal>
      </Section>
    </ScrollView>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Stack marginBottom={24}>
    <Text fontSize={18} fontWeight="700" color="#F2F8F3" marginBottom={12}>{title}</Text>
    {children}
  </Stack>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081A14' },
  content: { padding: 16, paddingBottom: 48 },
});