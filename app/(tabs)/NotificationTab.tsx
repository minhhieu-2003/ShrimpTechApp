import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSensorData } from '@/hooks/useFirebaseSync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Type definitions
interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  timestamp: number;
  acknowledged: boolean;
}

interface SensorData {
  water: {
    temp?: number;
    ph?: number;
    level?: number;
  };
  environment: {
    tds?: number;
  };
}

// Mock alerts hook (useSensorData imported above)

const useAlerts = () => {
  return {
    alerts: [] as Alert[],
    loading: false,
    createAlert: async (id: string, message: string, severity: string, metadata: any) => {},
    acknowledgeAlert: async (id: string) => {}
  };
};

const THRESHOLDS = {
  WATER_TEMP: { min: 25, max: 32 },
  pH: { min: 6.5, max: 8.5 },
  TDS: { min: 100, max: 800 },
  DO: { min: 5, max: 10 },
};

export default function NotificationTab() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { data: systemData, isOnline } = useSensorData();

  const styles = createStyles(colors);
  const { alerts, loading, acknowledgeAlert } = useAlerts();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredAlerts = alerts
    .filter((alert: Alert) => !alert.acknowledged)
    .sort((a: Alert, b: Alert) => b.timestamp - a.timestamp);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('notificationTitle')}</Text>
          <Text style={styles.subtitle}>
            {isOnline ? t('online') : t('offline')}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#2196f3']}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="loading" size={36} color="#2196f3" />
              <Text style={styles.loadingText}>{t('loadingAlerts')}</Text>
            </View>
          ) : filteredAlerts.length > 0 ? (
            <View style={styles.alertsContainer}>
              {filteredAlerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={[styles.alertItem, getSeverityStyle(alert.severity)]}
                  onPress={() => acknowledgeAlert(alert.id)}
                >
                  <View style={styles.alertHeader}>
                    <MaterialCommunityIcons
                      name={getAlertIcon(alert.type)}
                      size={24}
                      color={getAlertColor(alert.severity)}
                    />
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertTitle}>{getAlertTitle(alert.type)}</Text>
                      <Text style={styles.alertTimestamp}>
                        {formatTimestamp(alert.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noAlertsContainer}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#4caf50" />
              <Text style={styles.noAlertsTitle}>{t('noAlerts')}</Text>
              <Text style={styles.noAlertsSubtitle}>{t('systemNormal')}</Text>
            </View>
          )}

          <View style={styles.thresholdsContainer}>
            <Text style={styles.sectionTitle}>{t('alertThresholds')}</Text>
            {Object.entries(THRESHOLDS).map(([sensor, { min, max }]) => (
              <View key={sensor} style={styles.thresholdItem}>
                <MaterialCommunityIcons
                  name={getIconForSensor(sensor)}
                  size={24}
                  color={getSensorColor(sensor)}
                />
                <View style={styles.thresholdInfo}>
                  <Text style={styles.sensorName}>{getSensorLabel(sensor, t)}</Text>
                  <Text style={styles.rangeText}>
                    {min} - {max}{getSensorUnit(sensor)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// Helper functions
const formatTimestamp = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const { t } = require('@/contexts/LanguageContext');
  if (days > 0) return t('daysAgo', { count: days });
  if (hours > 0) return t('hoursAgo', { count: hours });
  if (minutes > 0) return t('minutesAgo', { count: minutes });
  return t('justNow');
};

const getSeverityStyle = (severity: string) => {
  const styles = {
    critical: { borderLeftColor: '#f44336', borderLeftWidth: 4 },
    high: { borderLeftColor: '#ff9800', borderLeftWidth: 4 },
    medium: { borderLeftColor: '#ffc107', borderLeftWidth: 4 },
    low: { borderLeftColor: '#4caf50', borderLeftWidth: 4 },
  };
  return styles[severity as keyof typeof styles] || {};
};

const getAlertIcon = (type: string) => {
  if (type.includes('WATER_TEMP')) return 'thermometer';
  if (type.includes('pH')) return 'water';
  if (type.includes('TDS')) return 'test-tube';
  if (type.includes('DO')) return 'air-filter';
  return 'alert';
};

const getAlertColor = (severity: string) => {
  const colors = {
    critical: '#f44336',
    high: '#ff9800',
    medium: '#ffc107',
    low: '#4caf50',
  };
  return colors[severity as keyof typeof colors] || '#757575';
};

const getAlertTitle = (type: string) => {
  const { t } = require('@/contexts/LanguageContext');
  if (type.includes('WATER_TEMP')) return t('waterTemp');
  if (type.includes('pH')) return t('phValue');
  if (type.includes('TDS')) return t('tdsValue');
  if (type.includes('DO')) return t('doValue');
  return t('systemAlert');
};

const getIconForSensor = (sensor: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    WATER_TEMP: 'thermometer',
    pH: 'water',
    TDS: 'test-tube',
    DO: 'air-filter',
  };
  return icons[sensor] || 'alert';
};

const getSensorColor = (sensor: string) => {
  const colors = {
    WATER_TEMP: '#ff5722',
    pH: '#4caf50',
    TDS: '#9c27b0',
    DO: '#2196f3',
  };
  return colors[sensor as keyof typeof colors] || '#757575';
};

const getSensorLabel = (sensor: string, t: (key: string) => string) => {
  const labels = {
    WATER_TEMP: t('waterTemp'),
    pH: t('phValue'),
    TDS: t('tdsValue'),
    DO: t('doValue'),
  };
  return labels[sensor as keyof typeof labels] || sensor;
};

const getSensorUnit = (sensor: string) => {
  const units = {
    WATER_TEMP: '°C',
    pH: '',
    TDS: ' ppm',
    DO: ' mg/L',
  };
  return units[sensor as keyof typeof units] || '';
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  alertsContainer: {
    padding: 16,
  },
  alertItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  alertTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noAlertsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noAlertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  noAlertsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  thresholdsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  thresholdInfo: {
    marginLeft: 12,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  rangeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
