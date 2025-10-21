// Common types for the application

export interface Device {
  id: string;
  name: string;
  path: string;
  icon?: string;
  state?: boolean;
}

export interface SensorData {
  water: {
    temp?: number;
    ph?: number;
    turbidity?: number;
    dissolved_oxygen?: number;
    tds?: number;
    level?: number;
  };
  gas: {
    ch4?: number;
    h2s?: number;
    nh3?: number;
    no2?: number;
  };
  environment: {
    tds?: number;
    temperature?: number;
    humidity?: number;
  };
}

export interface Schedule {
  hour_on: string;
  minute_on: string;
  hour_off: string;
  minute_off: string;
  enabled: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

export interface FirebaseConfig {
  id: string;
  name: string;
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export type Language = 'vi' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface StatisticsData {
  sensor: string;
  data: ChartDataPoint[];
  unit: string;
  min: number;
  max: number;
  avg: number;
}
