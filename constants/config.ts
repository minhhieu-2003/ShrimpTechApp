// Storage keys constants
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME_MODE: 'themeMode',
  FIREBASE_ID: 'currentFirebaseId',
  USER_DATA: 'userData',
  NOTIFICATIONS: 'notifications',
  SCHEDULE_CACHE: 'scheduleCache',
} as const;

// Firebase paths
export const FIREBASE_PATHS = {
  SENSORS: 'sensors',
  DEVICES: 'devices',
  SCHEDULES: 'schedules',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
} as const;

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'ShrimpTech',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'vi' as const,
  DEFAULT_THEME: 'system' as const,
  NOTIFICATION_LIMIT: 50,
  CHART_DATA_LIMIT: 100,
  REFRESH_INTERVAL: 5000, // 5 seconds
} as const;

// Sensor thresholds
export const SENSOR_THRESHOLDS = {
  TEMPERATURE: { min: 26, max: 32, unit: '°C' },
  PH: { min: 7.0, max: 8.5, unit: 'pH' },
  TURBIDITY: { min: 20, max: 60, unit: 'NTU' },
  DISSOLVED_OXYGEN: { min: 4.0, max: 8.0, unit: 'mg/L' },
  TDS: { min: 10, max: 30, unit: 'ppm' },
  WATER_LEVEL: { min: 80, max: 150, unit: 'cm' },
  CH4: { min: 0, max: 100, unit: 'ppm' },
  H2S: { min: 0, max: 0.05, unit: 'ppm' },
  NH3: { min: 0, max: 0.3, unit: 'ppm' },
  NO2: { min: 0, max: 0.1, unit: 'ppm' },
} as const;

// Status types
export const STATUS_TYPES = {
  NORMAL: 'normal',
  WARNING: 'warning',
  DANGER: 'danger',
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;
