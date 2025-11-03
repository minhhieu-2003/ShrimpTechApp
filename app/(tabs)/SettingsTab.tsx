// src/screens/SettingsTab.tsx
import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSensorData } from '@/hooks/useFirebaseSync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsTab() {
  const { language, setLanguage, t } = useLanguage();
  const { themeMode, setThemeMode, colors } = useTheme();
  const { currentConfig, isInitializing, switchToFirebase1, switchToFirebase2 } = useFirebaseConfig();
  const { isOnline, error, lastUpdate } = useSensorData();
  
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const styles = createStyles(colors);

  // Lưu cài đặt
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    saveSetting('notifications', value);
  };

  const handleAutoRefreshToggle = (value: boolean) => {
    setAutoRefresh(value);
    saveSetting('autoRefresh', value);
  };

  const handleSoundAlertsToggle = (value: boolean) => {
    setSoundAlerts(value);
    saveSetting('soundAlerts', value);
  };

  const handleLanguageSelect = (lang: 'vi' | 'en') => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleThemeSelect = (theme: 'auto' | 'light' | 'dark') => {
    // Cast theme to match the expected ThemeMode type
    setThemeMode(theme as any);
    setShowThemeModal(false);
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clearCacheTitle'),
      t('clearCacheMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(t('success'), t('clearCacheSuccess'));
            } catch (error) {
              Alert.alert(t('error'), t('clearCacheError'));
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      t('aboutAppTitle'),
      t('aboutAppMessage'),
      [{ text: t('ok') }]
    );
  };

  const handleFirebaseSwitch = async (type: 'firebase1' | 'firebase2') => {
    try {
      if (type === 'firebase1') {
        await switchToFirebase1();
      } else {
        await switchToFirebase2();
      }
      setShowFirebaseModal(false);
      Alert.alert(
        t('success'),
        `${t('switchedToFirebase')} ${type === 'firebase1' ? 'IoT Demo' : 'NCKH'}`,
        [{ text: t('ok') }]
      );
    } catch (error) {
      Alert.alert(t('error'), t('switchFirebaseError'));
    }
  };

  const getConnectionStatus = () => {
    if (isInitializing) {
      return { 
        text: t('connecting'), 
        color: '#FF9800', 
        icon: 'loading', 
        dot: '#FF9800' 
      };
    }
    if (error) {
      return { 
        text: t('error'), 
        color: '#F44336', 
        icon: 'alert-circle', 
        dot: '#F44336' 
      };
    }
    if (isOnline) {
      return { 
        text: t('connected'), 
        color: '#4CAF50', 
        icon: 'check-circle', 
        dot: '#4CAF50' 
      };
    }
    return { 
      text: t('disconnected'), 
      color: '#F44336', 
      icon: 'close-circle', 
      dot: '#F44336' 
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>{t('settings')}</Text>

      {/* Thông báo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notifications')}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('receiveNotifications')}</Text>
              <Text style={styles.settingDescription}>{t('receiveNotificationsDesc')}</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={notifications ? colors.primary : colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="volume-high" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('soundAlerts')}</Text>
              <Text style={styles.settingDescription}>{t('soundAlertsDesc')}</Text>
            </View>
          </View>
          <Switch
            value={soundAlerts}
            onValueChange={handleSoundAlertsToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={soundAlerts ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      {/* Hiển thị */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('display')}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="refresh-auto" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('autoRefresh')}</Text>
              <Text style={styles.settingDescription}>{t('autoRefreshDesc')}</Text>
            </View>
          </View>
          <Switch
            value={autoRefresh}
            onValueChange={handleAutoRefreshToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={autoRefresh ? colors.primary : colors.textSecondary}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => setShowThemeModal(true)}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('darkMode')}</Text>
              <Text style={styles.settingDescription}>
                {(themeMode as 'auto' | 'light' | 'dark') === 'auto' ? t('darkModeAuto') : themeMode === 'light' ? t('darkModeLight') : t('darkModeDark')}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="translate" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('language')}</Text>
              <Text style={styles.settingDescription}>{t('languageDesc')}</Text>
            </View>
          </View>
          <View style={styles.languageValue}>
            <Text style={styles.languageText}>
              {language === 'vi' ? t('vietnamese') : t('english')}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Hệ thống */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('system')}</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="delete-outline" size={24} color={colors.error} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>{t('clearCache')}</Text>
              <Text style={styles.settingDescription}>{t('clearCacheDesc')}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Thông tin */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('information')}</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="information-outline" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('aboutApp')}</Text>
              <Text style={styles.settingDescription}>{t('version')}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => setShowFirebaseModal(true)}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="firebase" size={24} color="#FFA000" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{t('firebase')}</Text>
              <Text style={styles.settingDescription}>
                {currentConfig?.name || 'Loading...'}
                {currentConfig?.projectId && ` • ${currentConfig.projectId}`}
              </Text>
              {lastUpdate && (
                <Text style={styles.timestampText}>
                  {t('lastUpdate')}: {lastUpdate.toLocaleTimeString('vi-VN')}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: connectionStatus.color + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: connectionStatus.dot }]} />
            <Text style={[styles.statusText, { color: connectionStatus.color }]}>
              {connectionStatus.text}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={16} 
              color={colors.textTertiary} 
              style={{ marginLeft: 4 }} 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <MaterialCommunityIcons name="water" size={32} color={colors.primary} />
        <Text style={styles.footerText}>{t('appName')}</Text>
        <Text style={styles.footerSubtext}>{t('appDescription')}</Text>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'vi' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageSelect('vi')}
            >
              <MaterialCommunityIcons 
                name="flag" 
                size={24} 
                color={language === 'vi' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.languageOptionText,
                language === 'vi' && styles.languageOptionTextActive
              ]}>
                Tiếng Việt
              </Text>
              {language === 'vi' && (
                <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageSelect('en')}
            >
              <MaterialCommunityIcons 
                name="flag" 
                size={24} 
                color={language === 'en' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.languageOptionText,
                language === 'en' && styles.languageOptionTextActive
              ]}>
                English
              </Text>
              {language === 'en' && (
                <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectTheme')}</Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                (themeMode as 'auto' | 'light' | 'dark') === 'auto' && styles.languageOptionActive
              ]}
              onPress={() => handleThemeSelect('auto')}
            >
              <MaterialCommunityIcons 
                name="theme-light-dark" 
                size={24} 
                color={(themeMode as 'auto' | 'light' | 'dark') === 'auto' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.languageOptionText,
                (themeMode as 'auto' | 'light' | 'dark') === 'auto' && styles.languageOptionTextActive
              ]}>
                {t('darkModeAuto')}
              </Text>
              {(themeMode as 'auto' | 'light' | 'dark') === 'auto' && (
                <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                themeMode === 'light' && styles.languageOptionActive
              ]}
              onPress={() => handleThemeSelect('light')}
            >
              <MaterialCommunityIcons 
                name="white-balance-sunny" 
                size={24} 
                color={themeMode === 'light' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.languageOptionText,
                themeMode === 'light' && styles.languageOptionTextActive
              ]}>
                {t('darkModeLight')}
              </Text>
              {themeMode === 'light' && (
                <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                themeMode === 'dark' && styles.languageOptionActive
              ]}
              onPress={() => handleThemeSelect('dark')}
            >
              <MaterialCommunityIcons 
                name="moon-waning-crescent" 
                size={24} 
                color={themeMode === 'dark' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.languageOptionText,
                themeMode === 'dark' && styles.languageOptionTextActive
              ]}>
                {t('darkModeDark')}
              </Text>
              {themeMode === 'dark' && (
                <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Firebase Selection Modal */}
      <Modal
        visible={showFirebaseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFirebaseModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFirebaseModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectFirebase')}</Text>
            
            <TouchableOpacity
              style={[
                styles.firebaseOption,
                currentConfig?.id === 'firebase1' && styles.firebaseOptionActive
              ]}
              onPress={() => handleFirebaseSwitch('firebase1')}
            >
              <MaterialCommunityIcons 
                name="firebase" 
                size={24} 
                color={currentConfig?.id === 'firebase1' ? '#FFA000' : colors.textSecondary} 
              />
              <View style={styles.firebaseOptionContent}>
                <Text style={[
                  styles.firebaseOptionTitle,
                  currentConfig?.id === 'firebase1' && styles.firebaseOptionTitleActive
                ]}>
                  IoT Demo
                </Text>
                <Text style={styles.firebaseOptionDesc}>iot-demo-80cb5</Text>
              </View>
              {currentConfig?.id === 'firebase1' && (
                <MaterialCommunityIcons name="check" size={24} color="#FFA000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.firebaseOption,
                currentConfig?.id === 'firebase2' && styles.firebaseOptionActive
              ]}
              onPress={() => handleFirebaseSwitch('firebase2')}
            >
              <MaterialCommunityIcons 
                name="firebase" 
                size={24} 
                color={currentConfig?.id === 'firebase2' ? '#FFA000' : colors.textSecondary} 
              />
              <View style={styles.firebaseOptionContent}>
                <Text style={[
                  styles.firebaseOptionTitle,
                  currentConfig?.id === 'firebase2' && styles.firebaseOptionTitleActive
                ]}>
                  NCKH
                </Text>
                <Text style={styles.firebaseOptionDesc}>nckh-8e369</Text>
              </View>
              {currentConfig?.id === 'firebase2' && (
                <MaterialCommunityIcons name="check" size={24} color="#FFA000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFirebaseModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  languageValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusBadgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusDotConnected,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 48,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  languageOptionActive: {
    backgroundColor: colors.primaryBackground,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  languageOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  firebaseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  firebaseOptionActive: {
    backgroundColor: '#FFA00020',
    borderWidth: 2,
    borderColor: '#FFA000',
  },
  firebaseOptionContent: {
    marginLeft: 12,
    flex: 1,
  },
  firebaseOptionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  firebaseOptionTitleActive: {
    color: '#FFA000',
    fontWeight: '600',
  },
  firebaseOptionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
