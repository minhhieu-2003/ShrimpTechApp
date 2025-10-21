import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSensorData } from '@/hooks/useFirebaseSync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StatisticsTab() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { data: systemData, isOnline, lastUpdate } = useSensorData();
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([]);
  const [phHistory, setPhHistory] = useState<number[]>([]);

  const styles = createStyles(colors);

  useEffect(() => {
    if (systemData && systemData.water && lastUpdate) {
      setTemperatureHistory(prev => {
        const newData = [...prev, systemData.water.temp ?? 0].slice(-10);
        return newData;
      });

      setPhHistory(prev => {
        const newData = [...prev, systemData.water.ph ?? 0].slice(-10);
        return newData;
      });
    }
  }, [systemData, lastUpdate]);

  const getWaterQualityStatus = () => {
    if (!systemData || !systemData.water) return { status: t('noHistoryData'), color: '#9e9e9e', icon: 'help-circle' };

    const waterTemp = systemData.water.temp ?? 0;
    const ph = systemData.water.ph ?? 0;
    const tds = systemData.water.tds ?? 0;

    // Critical conditions
    if (waterTemp < 15 || waterTemp > 30 || ph < 6.0 || ph > 9.0 || tds > 600) {
      return { status: t('warning'), color: '#f44336', icon: 'alert-circle' };
    } 
    // Warning conditions
    else if (waterTemp < 18 || waterTemp > 28 || ph < 6.5 || ph > 8.5 || tds < 100 || tds > 500) {
      return { status: t('needMonitoring'), color: '#ff9800', icon: 'alert' };
    } 
    // Good conditions
    else {
      return { status: t('good'), color: '#4caf50', icon: 'check-circle' };
    }
  };

  const waterQuality = getWaterQualityStatus();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="chart-box-outline" size={36} color="#2196f3" style={{marginBottom: 8}} />
        <Text style={styles.headerText}>{t('statisticsTitle')}</Text>
        <Text style={styles.headerDesc}>{t('statisticsDesc')}</Text>
        
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons name={isOnline ? 'wifi' : 'wifi-off'} size={18} color={isOnline ? '#4caf50' : '#f44336'} style={{marginRight: 4}} />
          <Text style={[styles.statusText, {color: isOnline ? '#4caf50' : '#f44336', fontWeight: 'bold'}]}>
            {isOnline ? t('updating') : t('disconnected')}
          </Text>
          <Text style={styles.statusText}>
            {lastUpdate ? ` • ${lastUpdate.toLocaleString('vi-VN')}` : ''}
          </Text>
        </View>
      </View>

      {/* Water Quality Summary */}
      <View style={[styles.summaryCard, {borderLeftWidth: 6, borderLeftColor: waterQuality.color}]}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons 
            name={waterQuality.icon as any} 
            size={28} 
            color={waterQuality.color} 
            style={{marginRight: 8}}
          />
          <Text style={styles.summaryTitle}>{t('waterQualityStatus')}</Text>
        </View>
        <Text style={[styles.summaryStatus, { color: waterQuality.color }]}>
          {waterQuality.status}
        </Text>
        <Text style={styles.summaryDesc}>
          {waterQuality.status === t('good') && t('goodDesc')}
          {waterQuality.status === t('needMonitoring') && t('needMonitoringDesc')}
          {waterQuality.status === t('warning') && t('warningDesc')}
        </Text>
      </View>

      {/* Data History Display */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 {t('dataOverTime')}</Text>
        <Text style={styles.chartDesc}>{t('chartDesc')}</Text>
        {temperatureHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>{t('recentTemperature')}</Text>
            <View style={styles.historyValues}>
              {temperatureHistory.slice(-5).map((temp, index) => (
                <View key={index} style={styles.historyValueBox}>
                  <MaterialCommunityIcons name="thermometer" size={14} color="#ff5722" style={{marginRight: 2}} />
                  <Text style={styles.historyValue}>{temp.toFixed(1)}°C</Text>
                </View>
              ))}
            </View>
            <Text style={styles.historyTitle}>{t('recentPH')}</Text>
            <View style={styles.historyValues}>
              {phHistory.slice(-5).map((ph, index) => (
                <View key={index} style={styles.historyValueBox}>
                  <MaterialCommunityIcons name="water" size={14} color="#2196f3" style={{marginRight: 2}} />
                  <Text style={styles.historyValue}>{ph.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
            <Text style={styles.noDataText}>{t('noHistoryData')}</Text>
          </View>
        )}
      </View>

      {/* Current Statistics */}
      {systemData && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📈 {t('currentStats')}</Text>
          <Text style={styles.statsDesc}>{t('currentStatsDesc')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="thermometer" size={24} color="#ff5722" />
              <Text style={styles.statLabel}>{t('avgWaterTemp')}</Text>
              <Text style={styles.statValue}>
                {temperatureHistory.length > 0 
                  ? (temperatureHistory.reduce((a, b) => a + b, 0) / temperatureHistory.length).toFixed(1)
                  : (systemData.water.temp ?? 0).toFixed(1)
                }°C
              </Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="water" size={24} color="#2196f3" />
              <Text style={styles.statLabel}>{t('avgPH')}</Text>
              <Text style={styles.statValue}>
                {phHistory.length > 0 
                  ? (phHistory.reduce((a, b) => a + b, 0) / phHistory.length).toFixed(2)
                  : (systemData.water.ph ?? 0).toFixed(2)
                }
              </Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="test-tube" size={24} color="#9c27b0" />
              <Text style={styles.statLabel}>{t('tds')}</Text>
              <Text style={styles.statValue}>{(systemData.water.tds ?? 0).toFixed(0)} ppm</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  summaryStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  chartDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  historyContainer: {
    padding: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  historyValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyValue: {
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.background,
    padding: 4,
    borderRadius: 4,
  },
  historyValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textTertiary,
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
});
