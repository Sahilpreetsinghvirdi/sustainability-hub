// mobile/src/screens/SettingsProfileScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Input, Avatar, Badge } from '@/ui';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const SettingsProfileScreen: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), timezone });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="$5" fontWeight="700" color="$color">Profile</Text>
        <Stack width={40} />
      </Stack>

      {/* Avatar Section */}
      <Card variant="elevated" padding="lg" alignItems="center" marginBottom="lg">
        <Avatar size="3xl" backgroundColor="$primary">
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Text fontSize="$5" fontWeight="700" color="$color" marginTop="3">{user?.name || 'User'}</Text>
        <Text fontSize="$3" color="$colorFocus">{user?.email || 'user@example.com'}</Text>
        <Badge variant="success" size="sm" marginTop="2">
          {user?.is_active ? 'Active Account' : 'Inactive'}
        </Badge>
        <Button variant="outline" size="sm" marginTop="3" onPress={() => {}}>
          <Stack flexDirection="row" alignItems="center" gap="1">
            <Ionicons name="camera" size={16} />
            <Text>Change Photo</Text>
          </Stack>
        </Button>
      </Card>

      {/* Personal Info */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
          <Text fontSize="$4" fontWeight="600" color="$color">Personal Information</Text>
          <Button variant="ghost" size="sm" onPress={() => setIsEditing(!isEditing)}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name={isEditing ? 'close' : 'pencil'} size={16} />
              <Text>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </Stack>
          </Button>
        </Stack>

        <Stack gap="4">
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            editable={isEditing}
            leftIcon={<Ionicons name="person" size={20} color="$colorFocus" />}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            type="email"
            leftIcon={<Ionicons name="mail" size={20} color="$colorFocus" />}
          />
          <Input
            label="Timezone"
            value={timezone}
            onChangeText={setTimezone}
            editable={isEditing}
            leftIcon={<Ionicons name="globe" size={20} color="$colorFocus" />}
          />
        </Stack>

        {isEditing && (
          <Button variant="primary" fullWidth loading={submitting} onPress={handleSaveProfile} marginTop="lg">
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="checkmark" size={20} />
              <Text>Save Changes</Text>
            </Stack>
          </Button>
        )}
      </Card>

      {/* Change Password */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
          <Text fontSize="$4" fontWeight="600" color="$color">Change Password</Text>
          <Button variant="ghost" size="sm" onPress={() => setIsChangingPassword(!isChangingPassword)}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name={isChangingPassword ? 'close' : 'key'} size={16} />
              <Text>{isChangingPassword ? 'Cancel' : 'Change'}</Text>
            </Stack>
          </Button>
        </Stack>

        {isChangingPassword && (
          <Stack gap="4">
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              type="password"
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed" size={20} color="$colorFocus" />}
            />
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              type="password"
              secureTextEntry
              leftIcon={<Ionicons name="key" size={20} color="$colorFocus" />}
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              type="password"
              secureTextEntry
              leftIcon={<Ionicons name="key" size={20} color="$colorFocus" />}
            />
            <Button variant="primary" fullWidth loading={submitting} onPress={handleChangePassword}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Ionicons name="checkmark" size={20} />
                <Text>Update Password</Text>
              </Stack>
            </Button>
          </Stack>
        )}
      </Card>

      {/* Account Stats */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="lg">Account Statistics</Text>
        <Stack gap="3">
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="$3" color="$colorFocus">Member Since</Text>
            <Text fontSize="$3" fontWeight="600" color="$color">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Text>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="$3" color="$colorFocus">Total Scans</Text>
            <Text fontSize="$3" fontWeight="600" color="$color">{user?.total_scans || 0}</Text>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="$3" color="$colorFocus">Carbon Saved</Text>
            <Text fontSize="$3" fontWeight="600" color="$primary">{user?.carbon_saved || 0} kg</Text>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Text fontSize="$3" color="$colorFocus">Streak</Text>
            <Text fontSize="$3" fontWeight="600" color="$warning">{user?.current_streak || 0} days</Text>
          </Stack>
        </Stack>
      </Card>
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '$background' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
};