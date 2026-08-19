// mobile/src/screens/TamaguiDemoScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, Text, Button, Card, Input, ProgressBar, Badge, Avatar, Modal, Sparkline, BarChart, PieChart } from '@/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons, Entypo } from '@expo/vector-icons';

export const TamaguiDemoScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(45);

  const sparklineData = [10, 15, 13, 17, 22, 20, 25, 28, 24, 30, 28, 32];
  const barData = [
    { label: 'Mon', value: 45, color: '$primary' },
    { label: 'Tue', value: 52, color: '$secondary' },
    { label: 'Wed', value: 38, color: '$warning' },
    { label: 'Thu', value: 61, color: '$success' },
    { label: 'Fri', value: 55, color: '$primary' },
    { label: 'Sat', value: 67, color: '$secondary' },
    { label: 'Sun', value: 43, color: '$error' },
  ];
  const pieData = [
    { label: 'Carbon', value: 187, color: '$primary' },
    { label: 'Energy', value: 120, color: '$secondary' },
    { label: 'Waste', value: 45, color: '$error' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={spacing.lg}>
        <Stack>
          <Text fontSize="$8" fontWeight="800" color="$color">Tamagui Demo</Text>
          <Text fontSize="$3" color="$colorFocus" marginTop="$1">All components styled with Tamagui</Text>
        </Stack>
        <Avatar size="lg" name="Tamagui Demo" source={{ uri: 'https://tamagui.dev/logo.png' }} status="online" />
      </Stack>

      {/* Buttons */}
      <Section title="Buttons">
        <Stack flexDirection="row" flexWrap="wrap" gap="$3" marginBottom="$4">
          <Button variant="primary" size="sm">Primary</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
          <Button variant="danger" size="sm">Danger</Button>
        </Stack>
        <Stack flexDirection="row" flexWrap="wrap" gap="$3" marginBottom="$4">
          <Button variant="primary" size="md">Primary</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" fullWidth style={{ width: 200 }}>Full Width</Button>
        </Stack>
        <Button variant="primary" loading>Loading...</Button>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <Stack gap="$3" marginBottom="$4">
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <Badge variant="success" size="sm">New</Badge>
            </CardHeader>
            <Text fontSize="$3" color="$color">Content with default styling and border</Text>
          </Card>
          <Card variant="elevated" padding="md" hoverable>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <Text fontSize="$3" color="$color">Elevated with shadow, hoverable</Text>
          </Card>
          <Card variant="outlined" padding="md">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
            </CardHeader>
            <Text fontSize="$3" color="$color">Thick border, transparent background</Text>
          </Card>
          <Card variant="filled" padding="md">
            <CardHeader>
              <CardTitle>Filled Card</CardTitle>
            </CardHeader>
            <Text fontSize="$3" color="$color">Background color, no border</Text>
          </Card>
        </Stack>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <Stack gap="$3" marginBottom="$4">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={inputValue}
            onChangeText={setInputValue}
            type="email"
            leftIcon={<Ionicons name="mail-outline" size={20} color="$colorFocus" />}
            helperText="We'll never share your email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value=""
            onChangeText={() => {}}
            type="password"
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="$colorFocus" />}
            error="Password must be at least 8 characters"
            required
          />
          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value=""
            onChangeText={() => {}}
            multiline
            numberOfLines={4}
            helperText="Max 500 characters"
          />
        </Stack>
      </Section>

      {/* Progress Bars */}
      <Section title="Progress Bars">
        <Stack gap="$3" marginBottom="$4">
          <ProgressBar progress={25} variant="default" size="md" showLabel label="Default" />
          <ProgressBar progress={60} variant="success" size="md" showLabel label="Success" />
          <ProgressBar progress={75} variant="warning" size="md" showLabel label="Warning" />
          <ProgressBar progress={90} variant="danger" size="md" showLabel label="Danger" />
          <ProgressBar progress={progress} variant="default" size="lg" showLabel label="Interactive" />
          <Stack flexDirection="row" gap="$3">
            <Button variant="ghost" size="sm" onPress={() => setProgress(Math.max(0, progress - 10))}><Ionicons name="remove" size={20} /></Button>
            <Button variant="ghost" size="sm" onPress={() => setProgress(Math.min(100, progress + 10))}><Ionicons name="add" size={20} /></Button>
          </Stack>
        </Stack>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <Stack flexDirection="row" flexWrap="wrap" gap="$2" marginBottom="$4">
          <Badge variant="default" size="sm">Default</Badge>
          <Badge variant="success" size="sm">Success</Badge>
          <Badge variant="warning" size="sm">Warning</Badge>
          <Badge variant="danger" size="sm">Danger</Badge>
          <Badge variant="info" size="sm">Info</Badge>
          <Badge variant="outline" size="sm">Outline</Badge>
        </Stack>
        <Stack flexDirection="row" flexWrap="wrap" gap="$2" marginBottom="$4">
          <Badge variant="success" size="md" dot>Online</Badge>
          <Badge variant="warning" size="md" dot>Away</Badge>
          <Badge variant="danger" size="md" dot>Busy</Badge>
          <Badge variant="info" size="md" dot>Focus</Badge>
        </Stack>
      </Section>

      {/* Avatars */}
      <Section title="Avatars">
        <Stack flexDirection="row" alignItems="center" gap="$3" marginBottom="$4">
          <Avatar size="xs" name="A" status="online" />
          <Avatar size="sm" name="AB" status="online" />
          <Avatar size="md" name="ABC" status="online" />
          <Avatar size="lg" name="ABCD" status="online" />
          <Avatar size="xl" name="ABCDE" status="online" />
        </Stack>
        <Stack flexDirection="row" alignItems="center" gap="$3">
          <Avatar size="md" name="Online" status="online" />
          <Avatar size="md" name="Busy" status="busy" />
          <Avatar size="md" name="Away" status="away" />
          <Avatar size="md" name="Offline" status="offline" />
        </Stack>
      </Section>

      {/* Charts */}
      <Section title="Charts">
        <Stack gap="$4" marginBottom="$4">
          <Stack>
            <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$3">Sparkline</Text>
            <Sparkline data={sparklineData} color="$primary" width={300} height={80} strokeWidth={3} fillOpacity={0.15} />
          </Stack>
          <Stack>
            <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$3">Bar Chart</Text>
            <BarChart data={barData} width={320} height={180} showLabels showValues animate />
          </Stack>
          <Stack>
            <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$3">Pie Chart</Text>
            <PieChart data={pieData} size={180} innerRadius={55} showLegend animate />
          </Stack>
        </Stack>
      </Section>

      {/* Modal Demo */}
      <Section title="Modal">
        <Button variant="primary" onPress={() => setModalVisible(true)}>Open Modal</Button>
        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Tamagui Modal"
          size="md"
        >
          <Stack gap="$3">
            <Text fontSize="$4" color="$color">This is a Tamagui Modal</Text>
            <Text fontSize="$3" color="$colorFocus">It supports animations, custom sizes, and full theming.</Text>
            <ProgressBar progress={75} variant="success" size="md" showLabel label="Demo Progress" />
            <Button variant="primary" fullWidth onPress={() => setModalVisible(false)}>Close</Button>
          </Stack>
        </Modal>
      </Section>

      {/* Theme Toggle */}
      <Section title="Theme">
        <Stack flexDirection="row" gap="$3">
          <Button variant="outline" onPress={() => {}}>Light</Button>
          <Button variant="primary" onPress={() => {}}>Dark</Button>
          <Button variant="outline" onPress={() => {}}>System</Button>
        </Stack>
      </Section>
    </ScrollView>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Stack gap="$3" marginBottom="$6">
    <Text fontSize="$5" fontWeight="700" color="$color">{title}</Text>
    {children}
  </Stack>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
});