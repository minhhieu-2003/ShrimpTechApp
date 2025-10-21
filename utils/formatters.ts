// Utility functions for formatting data

export const formatTemperature = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return `${value.toFixed(1)}°C`;
};

export const formatPH = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return value.toFixed(2);
};

export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return `${value.toFixed(1)}%`;
};

export const formatPPM = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return `${value.toFixed(1)} ppm`;
};

export const formatMGL = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return `${value.toFixed(2)} mg/L`;
};

export const formatWaterLevel = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--';
  return `${value.toFixed(0)} cm`;
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN');
};

export const formatTime = (hour: string, minute: string): string => {
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN');
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('vi-VN');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
};

export const getSensorColor = (value: number, min: number, max: number): string => {
  if (value < min) return '#f44336'; // Red
  if (value > max) return '#ff9800'; // Orange
  return '#4caf50'; // Green
};

export const getSensorStatus = (value: number, min: number, max: number): 'normal' | 'warning' | 'danger' => {
  if (value < min * 0.8 || value > max * 1.2) return 'danger';
  if (value < min || value > max) return 'warning';
  return 'normal';
};
