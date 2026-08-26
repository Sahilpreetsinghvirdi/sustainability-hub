// mobile/src/constants/config.ts
export const config = {
  // API
  api: {
    // For phone → desktop backend: replace localhost with your PC's LAN IP (e.g. '192.168.1.50')
    // Run 'ipconfig' on PC to find your IPv4 address. Backend must run on 0.0.0.0 or the LAN IP.
    baseUrl: __DEV__
      ? 'http://localhost:8000/api/v1'
      : 'https://api.sustainabilityhub.app/api/v1',
    timeout: 60000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Sync
  sync: {
    interval: 5 * 60 * 1000, // 5 minutes
    batchSize: 50,
    maxRetries: 5,
    retryBackoff: 2000,
  },

  // Storage
  storage: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImageDimension: 1920,
    imageQuality: 0.8,
    thumbnailSize: 300,
    cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Carbon
  carbon: {
    defaultMonthlyBudgetKg: 200,
    defaultAnnualBudgetKg: 2400,
    budgetWarningThreshold: 0.8,
    budgetDangerThreshold: 1.0,
  },

  // Energy
  energy: {
    defaultMonthlyKwhTarget: 400,
    baselineMultiplier: 1.15,
    auditConfidenceThreshold: 0.7,
  },

  // Food Waste
  foodWaste: {
    defaultMonthlyTargetKg: 3.5,
    streakGraceHours: 36,
    avoidableWasteThreshold: 0.15,
  },

  // Camera
  camera: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    allowEditing: false,
    mediaTypes: 'Images' as const,
  },

  // OCR
  ocr: {
    minConfidence: 0.6,
    languages: ['en'],
    detectOrientation: true,
  },

  // ML Models
  ml: {
    foodWasteModelVersion: 'v1.2.0',
    foodWasteModelUrl: 'https://models.sustainabilityhub.app/food-waste-v1.2.0.tflite',
    energyModelVersion: 'v1.0.0',
    confidenceThreshold: 0.5,
  },

  // Analytics
  analytics: {
    enabled: !__DEV__,
    sampleRate: 1.0,
    events: {
      screenView: 'screen_view',
      buttonClick: 'button_click',
      scanComplete: 'scan_complete',
      logSaved: 'log_saved',
      streakMilestone: 'streak_milestone',
      recommendationViewed: 'recommendation_viewed',
      recommendationActioned: 'recommendation_actioned',
    },
  },

  // Feature flags
  features: {
    offlineMode: true,
    socialSharing: true,
    achievements: true,
    communityChallenges: false,
    aiInsights: true,
    barcodeScanning: true,
    pdfImport: true,
    exportData: true,
    darkMode: true,
    biometricAuth: true,
  },

  // App info
  app: {
    name: 'Sustainability Hub',
    version: '1.4.6',
    buildNumber: '2',
    supportEmail: 'support@sustainabilityhub.app',
    privacyUrl: 'https://sustainabilityhub.app/privacy',
    termsUrl: 'https://sustainabilityhub.app/terms',
    websiteUrl: 'https://sustainabilityhub.app',
  },
};

export type Config = typeof config;