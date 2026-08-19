// mobile/src/screens/FoodWasteLogScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, Text, Button, Card, Badge, ProgressBar, Input } from '@/ui';
import { useFoodWaste } from '@/hooks/useFoodWaste';
import { formatWeight, formatCurrency, getMealColor } from '@/utils/formatters';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: 'weather-sunny', color: '#F59E0B', component: Ionicons },
  { id: 'lunch', label: 'Lunch', icon: 'weather-partly-sunny', color: '#EF4444', component: Ionicons },
  { id: 'dinner', label: 'Dinner', icon: 'moon', color: '#8B5CF6', component: Ionicons },
  { id: 'snack', label: 'Snack', icon: 'cookie', color: '#EC4899', component: MaterialIcons },
];

export const FoodWasteLogScreen: React.FC = () => {
  const { logWaste, isAnalyzing, analysisProgress } = useFoodWaste();
  const [step, setStep] = useState(1); // 1: meal type, 2: meal photo, 3: waste photo, 4: review
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner');
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [wasteImage, setWasteImage] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<any>(null);
  const [wasteAnalysis, setWasteAnalysis] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const mealTypeConfig = MEAL_TYPES.find(m => m.id === mealType) || MEAL_TYPES[2];

  const handleMealTypeSelect = (type: any) => {
    setMealType(type);
    if (step === 1) setStep(2);
  };

  const handleImagePick = async (type: 'meal' | 'waste') => {
    try {
      const permission = type === 'meal'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'meal') {
          setMealImage(result.assets[0].uri);
          setStep(3);
        } else {
          setWasteImage(result.assets[0].uri);
          setStep(4);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleCameraPick = async (type: 'meal' | 'waste') => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'meal') {
          setMealImage(result.assets[0].uri);
          setStep(3);
        } else {
          setWasteImage(result.assets[0].uri);
          setStep(4);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleImageSource = (type: 'meal' | 'waste') => {
    Alert.alert(
      type === 'meal' ? 'Meal Photo' : 'Waste Photo',
      'How would you like to add the photo?',
      [
        { text: 'Camera', onPress: () => handleCameraPick(type) },
        { text: 'Gallery', onPress: () => handleImagePick(type) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!mealImage || !wasteImage) {
      Alert.alert('Error', 'Please add both meal and waste photos');
      return;
    }

    setSubmitting(true);
    try {
      await logWaste(mealImage, wasteImage, mealType);
      router.push('/food-waste');
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleZeroWaste = () => {
    setWasteImage('zero-waste');
    setStep(4);
  };

  const getProgressLabel = () => {
    switch (step) {
      case 1: return 'Select Meal Type';
      case 2: return 'Photo Your Meal';
      case 3: return 'Photo Waste';
      case 4: return 'Review & Save';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Header */}
      <Card variant="elevated" padding="lg" marginBottom="lg" style={styles.progressCard}>
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
          <Text fontSize="16" fontWeight="600" color="#F8FAFC">Log Food Waste</Text>
          <Badge variant="outline" size="sm">Step {step} of 4</Badge>
        </Stack>
        <Stack flexDirection="row" gap="2">
          {[
            { label: 'Meal', step: 1 },
            { label: 'Meal Photo', step: 2 },
            { label: 'Waste Photo', step: 3 },
            { label: 'Review', step: 4 },
          ].map((item, index) => (
            <Stack key={item.label} flex={1} style={styles.progressStep}>
              <Stack
                width={32}
                height={32}
                borderRadius="full"
                backgroundColor={step > item.step ? '#22C55E' : step === item.step ? '#22C55E' : '#334155'}
                alignItems="center"
                justifyContent="center"
                marginBottom="1"
              >
                <Text fontSize="8" fontWeight="700" color={step >= item.step ? '#34D399' : step === item.step ? '#FFFFFF' : '#CBD5E1'}>
                  {index + 1}
                </Text>
              </Stack>
              <Text fontSize="4" color={step >= item.step ? '#22C55E' : step === item.step ? '#22C55E' : '#CBD5E1'} textAlign="center">
                {item.label}
              </Text>
            </Stack>
          ))}
        </Stack>
        <ProgressBar
          progress={(step / 4) * 100}
          variant={step === 4 ? 'success' : 'primary'}
          size="md"
          style={{ marginTop: 8 }}
        />
      </Card>

      {/* Step Content */}
      {step === 1 && <MealTypeStep onSelect={handleMealTypeSelect} />}
      {step === 2 && <PhotoStep
        title="Your Meal"
        subtitle="Take a photo of your plate before eating"
        image={mealImage}
        onPick={handleImageSource}
        type="meal"
        mealType={mealType}
      />}
      {step === 3 && <PhotoStep
        title="What Was Wasted"
        subtitle="Photo the leftovers, scraps, or packaging"
        image={wasteImage}
        onPick={handleImageSource}
        type="waste"
        mealType={mealType}
        showZeroWaste
        onZeroWaste={handleZeroWaste}
      />}
      {step === 4 && <ReviewStep
        mealType={mealType}
        mealImage={mealImage}
        wasteImage={wasteImage}
        onBack={() => setStep(3)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <Stack style={styles.analyzingOverlay}>
          <Card variant="elevated" padding="lg" style={styles.analyzingCard}>
            <Ionicons name="sync" size={48} color="#22C55E" />
            <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginTop="3" marginBottom="1">Analyzing Photos...</Text>
            <Text fontSize="8" color="#CBD5E1">{analysisProgress > 0 ? `${analysisProgress}%` : 'Identifying food & waste'}</Text>
            <ProgressBar progress={analysisProgress} variant="primary" size="lg" style={{ marginTop: 8 }} />
          </Card>
        </Stack>
      )}
    </ScrollView>
  );
};

const MealTypeStep = ({ onSelect }: any) => (
  <Stack gap="3">
    <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="md">What meal was this?</Text>
    <Stack flexDirection="row" flexWrap="wrap" gap="3">
      {MEAL_TYPES.map(type => (
        <TouchableOpacity
          key={type.id}
          onPress={() => onSelect(type.id)}
          style={styles.mealTypeButton}
        >
          <Stack
            width={60}
            height={60}
            borderRadius="lg"
            backgroundColor={type.color + '20'}
            alignItems="center"
            justifyContent="center"
            marginBottom="2"
          >
            <type.component name={type.icon} size={28} color={type.color} />
          </Stack>
          <Text fontSize="12" fontWeight="600" color="#F8FAFC">{type.label}</Text>
        </TouchableOpacity>
      ))}
    </Stack>
  </Stack>
);

const PhotoStep = ({ title, subtitle, image, onPick, type, mealType, showZeroWaste, onZeroWaste }: any) => {
  const mealTypeConfig = MEAL_TYPES.find(m => m.id === mealType) || MEAL_TYPES[2];

  if (image === 'zero-waste') {
    return (
      <Stack gap="lg" alignItems="center" style={styles.zeroWasteCard}>
        <Stack width={120} height={120} borderRadius="full" backgroundColor="rgba(34,197,94,0.2)" alignItems="center" justifyContent="center">
          <Entypo name="star" size={50} color="#22C55E" />
        </Stack>
        <Text fontSize="20" fontWeight="700" color="#F8FAFC">Zero Waste! ðŸŽ‰</Text>
        <Text fontSize="12" color="#CBD5E1" textAlign="center">You finished everything on your plate. Amazing!</Text>
        <Button variant="primary" fullWidth onPress={onSubmit}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Entypo name="star" size={20} />
            <Text>Save Zero Waste Meal</Text>
          </Stack>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => { setWasteImage(null); setStep(3); }}>Retake Photo</Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Card variant="default" padding="lg" alignItems="center">
        <Stack width={56} height={56} borderRadius="lg" backgroundColor={mealTypeConfig.color + '20'} alignItems="center" justifyContent="center" marginBottom="3">
          <mealTypeConfig.component name={mealTypeConfig.icon} size={28} color={mealTypeConfig.color} />
        </Stack>
        <Text fontSize="16" fontWeight="600" color="#F8FAFC">{title}</Text>
        <Text fontSize="8" color="#CBD5E1" textAlign="center">{subtitle}</Text>
      </Card>

      {image ? (
        <Card variant="default" padding="0" overflow="hidden" style={styles.imagePreview}>
          <Stack style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <Stack style={styles.imageOverlay}>
              <Badge variant="success" size="sm">Photo Captured</Badge>
            </Stack>
          </Stack>
          <Stack style={styles.imageActions}>
            <Button variant="ghost" onPress={() => { if (type === 'meal') setMealImage(null); else setWasteImage(null); }}>
              <Stack flexDirection="row" alignItems="center" gap="1">
                <Ionicons name="camera" size={20} />
                <Text>Retake</Text>
              </Stack>
            </Button>
            <Button variant="primary" onPress={() => setStep(type === 'meal' ? 3 : 4)}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Ionicons name={type === 'meal' ? 'arrow-forward' : 'checkmark'} size={20} />
                <Text>{type === 'meal' ? 'Next: Waste Photo' : 'Review & Save'}</Text>
              </Stack>
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card variant="outlined" padding="xl" alignItems="center" style={styles.cameraCard}>
          <Stack width={80} height={80} borderRadius="full" backgroundColor="rgba(34,197,94,0.1)" alignItems="center" justifyContent="center" marginBottom="4">
            <Ionicons name="camera" size={40} color="#22C55E" />
          </Stack>
          <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="1">No Photo Yet</Text>
          <Text fontSize="8" color="#CBD5E1" textAlign="center" marginBottom="6">Tap to add photo</Text>
          <Stack flexDirection="row" gap="3">
            <Button variant="secondary" onPress={() => onPick(type)}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Ionicons name="image" size={20} />
                <Text>Gallery</Text>
              </Stack>
            </Button>
            <Button variant="primary" onPress={() => handleCameraPick(type)}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Ionicons name="camera" size={20} />
                <Text>Camera</Text>
              </Stack>
            </Button>
          </Stack>
          {showZeroWaste && (
            <Button variant="ghost" fullWidth style={{ marginTop: 4 }} onPress={onZeroWaste}>
              <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
                <Entypo name="star" size={20} />
                <Text>Zero Waste - I Ate Everything!</Text>
              </Stack>
            </Button>
          )}
        </Card>
      )}
    </Stack>
  );
};

const ReviewStep = ({ mealType, mealImage, wasteImage, onBack, onSubmit, submitting }: any) => {
  const mealTypeConfig = MEAL_TYPES.find(m => m.id === mealType) || MEAL_TYPES[2];

  return (
    <Stack gap="lg">
      <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="md">Review Your Log</Text>

      <Card variant="default" padding="0" overflow="hidden" style={styles.reviewImages}>
        <Stack flexDirection="row">
          <Stack flex={1} style={styles.reviewImageSlot}>
            <Image source={{ uri: mealImage }} style={styles.reviewImage} resizeMode="cover" />
            <Stack style={styles.reviewImageLabel}>
              <Stack flexDirection="row" alignItems="center" gap="1">
                <Stack width={8} height={8} borderRadius="full" backgroundColor={mealTypeConfig.color} />
                <Text fontSize="8" fontWeight="600" color="#F8FAFC">{mealTypeConfig.label}</Text>
              </Stack>
              <Text fontSize="4" color="#CBD5E1">Meal Photo</Text>
            </Stack>
          </Stack>
          <Stack width={1} backgroundColor="#334155" />
          <Stack flex={1} style={styles.reviewImageSlot}>
            {wasteImage === 'zero-waste' ? (
              <Stack style={[styles.reviewImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.05)' }]}>
                <Entypo name="star" size={60} color="#22C55E" />
                <Text fontSize="12" fontWeight="600" color="#22C55E" marginTop="3">Zero Waste!</Text>
                <Text fontSize="4" color="#CBD5E1">No waste photo needed</Text>
              </Stack>
            ) : (
              <>
                <Image source={{ uri: wasteImage }} style={styles.reviewImage} resizeMode="cover" />
                <Stack style={styles.reviewImageLabel}>
                  <Text fontSize="8" fontWeight="600" color="#EF4444" marginBottom="1">Waste Photo</Text>
                  <Text fontSize="4" color="#CBD5E1">Leftovers & Scraps</Text>
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      </Card>

      <Card variant="elevated" padding="lg" style={styles.estimateCard}>
        <Text fontSize="16" fontWeight="600" color="#F8FAFC" marginBottom="lg">Estimated Impact</Text>
        <Stack flexDirection="row" gap="4">
          <EstimateItem label="Avoidable Waste" value="~200g" color="#EF4444" icon={<Ionicons name="trash" size={22} />} />
          <EstimateItem label="Cost" value="~8.50" color="#F59E0B" icon={<Ionicons name="cash" size={22} />} />
          <EstimateItem label="COâ‚‚e" value="~1.2 kg" color="#22C55E" icon={<Ionicons name="leaf" size={22} />} />
        </Stack>
        <Text fontSize="4" color="#CBD5E1" marginTop="4" textAlign="center">Estimates based on AI analysis</Text>
      </Card>

      <Stack gap="3" style={styles.actions}>
        <Button variant="secondary" fullWidth onPress={onBack}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="arrow-back" size={20} />
            <Text>Back</Text>
          </Stack>
        </Button>
        <Button variant="primary" fullWidth loading={submitting} onPress={onSubmit}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Ionicons name="save" size={20} />
            <Text>Save Log</Text>
          </Stack>
        </Button>
      </Stack>
    </Stack>
  );
};

const EstimateItem = ({ label, value, color, icon }: any) => (
  <Stack flex={1} alignItems="center" gap="1">
    <Stack width={36} height={36} borderRadius="md" backgroundColor={color + '20'} alignItems="center" justifyContent="center">
      {icon}
    </Stack>
    <Text fontSize="16" fontWeight="700" color={color}>{value}</Text>
    <Text fontSize="4" color="#CBD5E1">{label}</Text>
  </Stack>
);

const styles = {
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 24 },
  progressCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  progressStep: { alignItems: 'center' },
  mealTypeButton: { flex: 1, minWidth: 70, padding: 16, borderRadius: 16, backgroundColor: '#1E2D4D', alignItems: 'center' },
  zeroWasteCard: { padding: 32 },
  imagePreview: { overflow: 'hidden' },
  imageContainer: { position: 'relative' },
  previewImage: { width: '100%', height: 200 },
  imageOverlay: { position: 'absolute', top: 12, right: 12 },
  imageActions: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  cameraCard: { minHeight: 280 },
  reviewImages: { overflow: 'hidden' },
  reviewImageSlot: { position: 'relative' },
  reviewImage: { width: '100%', height: 140 },
  reviewImageLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.7)' },
  estimateCard: { backgroundColor: 'rgba(34,197,94,0.05)' },
  actions: { marginTop: 8 },
  analyzingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  analyzingCard: { width: '90%', maxWidth: 320 },
};