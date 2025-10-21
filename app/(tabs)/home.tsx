import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceControl } from '@/hooks/useDeviceControl';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const { devices, deviceStates, controlDevice } = useDeviceControl();
  const {
    currentConfig,
    currentDatabase,
    isInitializing,
    switchToFirebase1,
    switchToFirebase2,
  } = useFirebaseConfig();



  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    databaseURL: '',
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  });
  const allConfigs: any[] = []; // You'll need to implement this based on your Firebase config management

  const styles = createStyles(colors);





  const handleSwitchFirebase = async (toFirebase: 1 | 2) => {
    if (isInitializing) {
      Alert.alert(t('please_wait'), t('switchingFirebase'));
      return;
    }

    try {
      if (toFirebase === 1) {
        await switchToFirebase1();
        Alert.alert(t('success'), t('switchedToFirebaseDemo'));
      } else {
        await switchToFirebase2();
        Alert.alert(t('success'), t('switchedToFirebaseNCKH'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('switchFirebaseError'));
    }
  };

  const handleSwitchConfig = (configId: string) => {
    // Implement config switching logic
    setShowConfigModal(false);
  };

  const handleDeleteConfig = (configId: string, configName: string) => {
    Alert.alert(
      t('confirmDelete'),
      t('confirmDeleteMessage') + ` "${configName}"`,
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => {
          // Implement delete logic
        }}
      ]
    );
  };

  const openEditModal = (config: any) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      databaseURL: config.databaseURL,
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId || '',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      databaseURL: '',
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: '',
    });
  };

  const handleUpdateConfig = () => {
    // Implement update config logic
    Alert.alert('Success', 'Config updated successfully');
    setEditingConfig(null);
    resetForm();
  };

  const handleAddConfig = () => {
    // Implement add config logic
    Alert.alert('Success', 'Config added successfully');
    setShowAddModal(false);
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('@/assets/images/Logo.jpg')} 
          style={styles.logo} 
        />
        <Text style={styles.headerText}>{t('ShrimpTech')}</Text>
        <Text style={styles.headerSubtitle}>{t('appDescription')}</Text>
      </View>

      {/* Firebase Switcher Card */}
      <View style={styles.firebaseSwitcherCard}>
        <View style={styles.switcherHeader}>
          <MaterialCommunityIcons name="database" size={32} color="#2196f3" />
          <View style={styles.switcherHeaderText}>
            <Text style={styles.switcherTitle}>
              {language === 'vi' ? 'Chuyển đổi Firebase' : 'Switch Firebase'}
            </Text>
            <Text style={styles.switcherSubtitle}>
              {language === 'vi' ? 'Hiện tại' : 'Current'}: <Text style={styles.currentDbName}>{currentConfig?.name || 'N/A'}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.switcherButtons}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              currentConfig?.id === 'firebase1' && styles.switchButtonActive,
              isInitializing && styles.switchButtonDisabled,
            ]}
            onPress={() => handleSwitchFirebase(1)}
            disabled={isInitializing || currentConfig?.id === 'firebase1'}
          >
            <MaterialCommunityIcons 
              name="database-check" 
              size={24} 
              color={currentConfig?.id === 'firebase1' ? '#fff' : '#2196f3'} 
            />
            <Text style={[
              styles.switchButtonText,
              currentConfig?.id === 'firebase1' && styles.switchButtonTextActive,
            ]}>
              IoT Demo
            </Text>
            {currentConfig?.id === 'firebase1' && (
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchButton,
              currentConfig?.id === 'firebase2' && styles.switchButtonActive,
              isInitializing && styles.switchButtonDisabled,
            ]}
            onPress={() => handleSwitchFirebase(2)}
            disabled={isInitializing || currentConfig?.id === 'firebase2'}
          >
            <MaterialCommunityIcons 
              name="database-check" 
              size={24} 
              color={currentConfig?.id === 'firebase2' ? '#fff' : '#4caf50'} 
            />
            <Text style={[
              styles.switchButtonText,
              currentConfig?.id === 'firebase2' && styles.switchButtonTextActive,
            ]}>
              NCKH
            </Text>
            {currentConfig?.id === 'firebase2' && (
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {isInitializing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2196f3" />
            <Text style={styles.loadingText}>
              {language === 'vi' ? 'Đang chuyển đổi...' : 'Switching...'}
            </Text>
          </View>
        )}
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <MaterialCommunityIcons name="hand-wave" size={48} color="#2196f3" />
        <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
        <Text style={styles.welcomeText}>{t('welcomeMessage')}</Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>{t('features')}</Text>
        
        <View style={styles.featureCard}>
          <MaterialCommunityIcons name="monitor-dashboard" size={32} color="#4caf50" />
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{t('monitoring')}</Text>
            <Text style={styles.featureDesc}>{t('monitoringDesc')}</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <MaterialCommunityIcons name="tune" size={32} color="#ff9800" />
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{t('controlTitle')}</Text>
            <Text style={styles.featureDesc}>{t('controlDesc')}</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <MaterialCommunityIcons name="chart-line" size={32} color="#9c27b0" />
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{t('statisticsTitle')}</Text>
            <Text style={styles.featureDesc}>{t('statisticsDesc')}</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <MaterialCommunityIcons name="bell" size={32} color="#f44336" />
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{t('notificationTitle')}</Text>
            <Text style={styles.featureDesc}>{t('notificationDesc')}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>{t('quickInfo')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="water" size={24} color="#2196f3" />
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>{t('waterSensors')}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="cloud" size={24} color="#607d8b" />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>{t('gasSensors')}</Text>
          </View>
        </View>
      </View>





      {/* Pond List Modal */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.configModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Danh sách ao nuôi</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.configList}>
              {allConfigs.map((config) => (
                <View
                  key={config.id}
                  style={[
                    styles.configItem,
                    currentConfig?.id === config.id && styles.configItemActive,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.configItemMain}
                    onPress={() => handleSwitchConfig(config.id)}
                  >
                    <MaterialCommunityIcons
                      name={currentConfig?.id === config.id ? 'check-circle' : 'circle-outline'}
                      size={24}
                      color={currentConfig?.id === config.id ? '#4caf50' : colors.textSecondary}
                    />
                    <View style={styles.configItemInfo}>
                      <Text style={styles.configItemName}>{config.name}</Text>
                      <Text style={styles.configItemUrl} numberOfLines={1}>
                        {config.databaseURL}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.configItemActions}>
                    <TouchableOpacity
                      onPress={() => {
                        openEditModal(config);
                        setShowConfigModal(false);
                      }}
                      style={styles.iconButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#2196f3" />
                    </TouchableOpacity>

                    {config.id !== 'default' && (
                      <TouchableOpacity
                        onPress={() => handleDeleteConfig(config.id, config.name)}
                        style={styles.iconButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setShowConfigModal(false);
                setShowAddModal(true);
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Thêm ao mới</Text>
  <Text style={styles.addButtonText}>{t('addNewPond')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Config Modal */}
      <Modal
        visible={showAddModal || editingConfig !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingConfig(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.configModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingConfig ? 'Chỉnh sửa ao nuôi' : 'Thêm ao nuôi mới'}
  {editingConfig ? t('editPond') : t('addNewPond')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingConfig(null);
                  resetForm();
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Tên ao nuôi *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="VD: Ao cá tra số 1"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.inputLabel}>Database URL *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://your-project.firebaseio.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.databaseURL}
                onChangeText={(text) => setFormData({ ...formData, databaseURL: text })}
              />

              <Text style={styles.inputLabel}>API Key *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="AIzaSy..."
                placeholderTextColor={colors.textSecondary}
                value={formData.apiKey}
                onChangeText={(text) => setFormData({ ...formData, apiKey: text })}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Auth Domain</Text>
              <TextInput
                style={styles.formInput}
                placeholder="your-project.firebaseapp.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.authDomain}
                onChangeText={(text) => setFormData({ ...formData, authDomain: text })}
              />

              <Text style={styles.inputLabel}>Project ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="your-project-id"
                placeholderTextColor={colors.textSecondary}
                value={formData.projectId}
                onChangeText={(text) => setFormData({ ...formData, projectId: text })}
              />

              <Text style={styles.inputLabel}>Storage Bucket</Text>
              <TextInput
                style={styles.formInput}
                placeholder="your-project.appspot.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.storageBucket}
                onChangeText={(text) => setFormData({ ...formData, storageBucket: text })}
              />

              <Text style={styles.inputLabel}>Messaging Sender ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="123456789"
                placeholderTextColor={colors.textSecondary}
                value={formData.messagingSenderId}
                onChangeText={(text) => setFormData({ ...formData, messagingSenderId: text })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>App ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="1:123456789:web:abc123"
                placeholderTextColor={colors.textSecondary}
                value={formData.appId}
                onChangeText={(text) => setFormData({ ...formData, appId: text })}
              />

              <Text style={styles.inputLabel}>Measurement ID (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="G-XXXXXXXXXX"
                placeholderTextColor={colors.textSecondary}
                value={formData.measurementId}
                onChangeText={(text) => setFormData({ ...formData, measurementId: text })}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingConfig ? handleUpdateConfig : handleAddConfig}
            >
              <Text style={styles.saveButtonText}>
                {editingConfig ? 'Cập nhật' : 'Thêm mới'}
  {editingConfig ? t('update') : t('add')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
    paddingVertical: 20,
  },
  logo: {
    width: 180,
    height: 140,
    marginBottom: 16,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  firebaseSwitcherCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switcherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switcherHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  switcherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  switcherSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  currentDbName: {
    fontWeight: '600',
    color: '#2196f3',
  },
  switcherButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.tabBarBorder,
    gap: 8,
  },
  switchButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  switchButtonDisabled: {
    opacity: 0.5,
  },
  switchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  switchButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  welcomeCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },

  configModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  configList: {
    maxHeight: 400,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  configItemActive: {
    borderColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  configItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  configItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  configItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  configItemUrl: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  configItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    maxHeight: 500,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
  },
  saveButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
