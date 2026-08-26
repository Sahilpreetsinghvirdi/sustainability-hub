// mobile/src/screens/SettingsHouseholdScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, Text, Button, Card, Input, Badge, Avatar } from '@/ui';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const HOUSEHOLD_SIZES = ['1', '2', '3', '4', '5', '6+'];

export const SettingsHouseholdScreen: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [householdName, setHouseholdName] = useState(user?.household?.name || 'My Household');
  const [householdSize, setHouseholdSize] = useState(String(user?.household?.size || 2));
  const [zipCode, setZipCode] = useState(user?.household?.zip_code || '');
  const [homeType, setHomeType] = useState(user?.household?.home_type || 'apartment');
  const [submitting, setSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const homeTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
  ];

  const handleSave = async () => {
    if (!householdName.trim()) {
      Alert.alert('Error', 'Household name is required');
      return;
    }

    setSubmitting(true);
    try {
      // Would call updateHousehold API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      Alert.alert('Success', 'Household updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update household');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setIsRemoving(true);
        setTimeout(() => setIsRemoving(false), 1000);
      }},
    ]);
  };

  const household = {
    name: householdName,
    size: parseInt(householdSize) || 2,
    zip_code: zipCode,
    home_type: homeType,
    members: [
      { id: '1', name: user?.name || 'You', email: user?.email || '', role: 'owner', avatar: 'Y' },
    ],
    created_at: user?.household?.created_at || new Date().toISOString(),
    total_scans: 47,
    avg_carbon_per_person: 124,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Button>
        <Text fontSize="20" fontWeight="700" color="#F2F8F3">Household</Text>
        <Button variant="ghost" size="sm" onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? 'close' : 'pencil'} size={20} />
        </Button>
      </Stack>

      {/* Household Info */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.householdCard}>
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={56} height={56} borderRadius="lg" backgroundColor="rgba(34,197,94,0.2)" alignItems="center" justifyContent="center">
            <Ionicons name="home" size={28} color="#57C58A" />
          </Stack>
          <Stack flex={1}>
            {isEditing ? (
              <Input value={householdName} onChangeText={setHouseholdName} />
            ) : (
              <>
                <Text fontSize="20" fontWeight="700" color="#F2F8F3">{household.name}</Text>
                <Text fontSize="8" color="#C4D8CB">Created {new Date(household.created_at).toLocaleDateString()}</Text>
              </>
            )}
          </Stack>
          {isEditing ? (
            <Badge variant="primary" size="sm">Editing</Badge>
          ) : (
            <Badge variant="success" size="sm">Active</Badge>
          )}
        </Stack>

        <Stack flexDirection="row" gap="3">
          <Stack flex={1} alignItems="center" style={styles.statItem}>
            <Text fontSize="20" fontWeight="800" color="#F2F8F3">{household.size}</Text>
            <Text fontSize="8" color="#C4D8CB">Members</Text>
          </Stack>
          <Stack flex={1} alignItems="center" style={styles.statItem}>
            <Text fontSize="20" fontWeight="800" color="#F2B85B">{household.total_scans}</Text>
            <Text fontSize="8" color="#C4D8CB">Total Scans</Text>
          </Stack>
          <Stack flex={1} alignItems="center" style={styles.statItem}>
            <Text fontSize="20" fontWeight="800" color="#57C58A">{household.avg_carbon_per_person}</Text>
            <Text fontSize="8" color="#C4D8CB">kgCOâ‚‚e/person</Text>
          </Stack>
        </Stack>
      </Card>

      {/* Settings */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Text fontSize="16" fontWeight="600" color="#F2F8F3" marginBottom="lg">Household Settings</Text>

        <Stack gap="4">
          {isEditing && (
            <>
              <Stack>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3" marginBottom="1">Household Size</Text>
                <Stack flexDirection="row" gap="2">
                  {HOUSEHOLD_SIZES.map(size => (
                    <Button
                      key={size}
                      variant={householdSize === size ? 'primary' : 'outline'}
                      size="sm"
                      flex={1}
                      onPress={() => setHouseholdSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              <Input
                label="ZIP Code"
                placeholder="12345"
                value={zipCode}
                onChangeText={setZipCode}
                leftIcon={<Ionicons name="location" size={20} color="#C4D8CB" />}
              />

              <Stack>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3" marginBottom="1">Home Type</Text>
                <Stack flexDirection="row" gap="2">
                  {homeTypes.map(type => (
                    <Button
                      key={type.value}
                      variant={homeType === type.value ? 'primary' : 'outline'}
                      size="sm"
                      flex={1}
                      onPress={() => setHomeType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </>
          )}

          {!isEditing && (
            <Stack gap="3">
              <Stack flexDirection="row" justifyContent="space-between">
                <Text fontSize="12" color="#C4D8CB">Size</Text>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3">{household.size} people</Text>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Text fontSize="12" color="#C4D8CB">ZIP Code</Text>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3">{household.zip_code || 'Not set'}</Text>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Text fontSize="12" color="#C4D8CB">Home Type</Text>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3">{household.home_type}</Text>
              </Stack>
            </Stack>
          )}
        </Stack>

        {isEditing && (
          <Button variant="primary" fullWidth loading={submitting} onPress={handleSave} marginTop="lg">
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="checkmark" size={20} />
              <Text>Save Settings</Text>
            </Stack>
          </Button>
        )}
      </Card>

      {/* Members */}
      <Card variant="default" padding="lg" marginBottom="lg">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
          <Text fontSize="16" fontWeight="600" color="#F2F8F3">Members</Text>
          <Button variant="ghost" size="sm" onPress={() => Alert.alert('Invite Member', 'Share the invite link with household members')}>
            <Stack flexDirection="row" alignItems="center" gap="1">
              <Ionicons name="add" size={16} />
              <Text>Invite</Text>
            </Stack>
          </Button>
        </Stack>

        <Stack gap="3">
          {household.members.map((member: any) => (
            <Stack key={member.id} flexDirection="row" alignItems="center" gap="3" style={styles.memberItem}>
              <Avatar size="md" backgroundColor="#57C58A">
                {member.avatar}
              </Avatar>
              <Stack flex={1}>
                <Text fontSize="12" fontWeight="600" color="#F2F8F3">{member.name}</Text>
                <Text fontSize="8" color="#C4D8CB">{member.email}</Text>
              </Stack>
              <Badge variant={member.role === 'owner' ? 'primary' : 'outline'} size="sm">
                {member.role}
              </Badge>
              {member.role !== 'owner' && (
                <Button variant="ghost" size="xs" onPress={() => handleRemoveMember(member.id)}>
                  <Ionicons name="close-circle" size={20} color="#E97966" />
                </Button>
              )}
            </Stack>
          ))}
        </Stack>

        <Button variant="outline" fullWidth marginTop="lg" onPress={() => Alert.alert('Invite Member', 'Share the invite link with household members')}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="add" size={20} />
            <Text>Invite Member</Text>
          </Stack>
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card variant="default" padding="lg" marginBottom="lg" style={styles.dangerCard}>
        <Stack flexDirection="row" alignItems="center" gap="3" marginBottom="lg">
          <Stack width={40} height={40} borderRadius="lg" backgroundColor="rgba(239,68,68,0.2)" alignItems="center" justifyContent="center">
            <Ionicons name="warning" size={22} color="#E97966" />
          </Stack>
          <Stack flex={1}>
            <Text fontSize="16" fontWeight="600" color="#E97966">Danger Zone</Text>
            <Text fontSize="8" color="#C4D8CB">Irreversible actions</Text>
          </Stack>
        </Stack>

        <Stack gap="3">
          <Button variant="outline" fullWidth onPress={() => Alert.alert('Leave Household', 'Are you sure?')} style={styles.dangerButton}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="exit" size={20} color="#E97966" />
              <Text style={{ color: '#E97966' }}>Leave Household</Text>
            </Stack>
          </Button>
          <Button variant="outline" fullWidth onPress={() => Alert.alert('Delete Household', 'This cannot be undone')} style={styles.dangerButton}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
              <Ionicons name="trash" size={20} color="#E97966" />
              <Text style={{ color: '#E97966' }}>Delete Household</Text>
            </Stack>
          </Button>
        </Stack>
      </Card>
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#081A14' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  householdCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  statItem: { padding: 12, borderRadius: 12, backgroundColor: '#193A2A' },
  memberItem: { padding: 8, borderRadius: 8, backgroundColor: '#193A2A' },
  dangerCard: { backgroundColor: 'rgba(239,68,68,0.05)' },
  dangerButton: { borderColor: '#E97966' },
};
