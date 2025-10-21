import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  vi: {
    // Common
    appName: 'ShrimpTech',
    appDescription: 'Hệ thống quản lý nuôi tôm thông minh',
    welcome: 'Chào mừng',
    welcomeMessage: 'Giải pháp công nghệ cho nuôi trồng thủy sản',
    
    // Tabs
    home: 'Trang chủ',
    control: 'Điều khiển',
    statistics: 'Thống kê',
    notifications: 'Thông báo',
    settings: 'Cài đặt',
    explore: 'Khám phá',
    
    // Devices
    autoFeeder: 'Máy cho ăn',
    siphonPump: 'Máy siphong',
    'waterPump-In': 'Bơm nước vào',
    'waterPump-Out': 'Bơm nước ra',
    oxygenPump: 'Máy bơm oxy',
    oxygenFan: 'Quạt oxy',
    electrolyzer: 'Máy điện phân',
    lightingLamp: 'Đèn chiếu sáng',
    
    // Sensors
    temperature: 'Nhiệt độ',
    ph: 'Độ pH',
    turbidity: 'Độ đục',
    dissolvedOxygen: 'Oxy hòa tan',
    tds: 'TDS',
    waterLevel: 'Mực nước',
    ch4: 'CH4',
    h2s: 'H2S',
    nh3: 'NH3',
    no2: 'NO2',
    
    // Status
    connected: 'Đã kết nối',
    disconnected: 'Mất kết nối',
    connecting: 'Đang kết nối',
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    error: 'Lỗi',
    success: 'Thành công',
    loading: 'Đang tải...',
    
    // Actions
    turnOn: 'Bật',
    turnOff: 'Tắt',
    refresh: 'Làm mới',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    
    // Schedule
    schedule: 'Lịch trình',
    timeOn: 'Giờ bật',
    timeOff: 'Giờ tắt',
    enabled: 'Đã kích hoạt',
    disabled: 'Đã tắt',
    
    // Voice Control
    voiceControl: 'Điều khiển giọng nói',
    listening: 'Đang nghe...',
    speaking: 'Đang nói...',
    say: 'Nói',
    recognized: 'Đã nhận diện',
    
    // Tab titles
    monitoring: 'Giám sát',
    controlTitle: 'Điều khiển',
    statisticsTitle: 'Thống kê',
    notificationTitle: 'Thông báo',
    
    // Control Tab
    deviceControl: 'Điều khiển thiết bị',
    scheduleModal: 'Cài đặt lịch trình',
    hourOn: 'Giờ bật',
    hourOff: 'Giờ tắt',
    enableSchedule: 'Kích hoạt lịch trình',
    exampleCommands: 'Ví dụ lệnh điều khiển',
    
    // Settings
    display: 'Hiển thị',
    system: 'Hệ thống',
    information: 'Thông tin',
    receiveNotifications: 'Nhận thông báo',
    receiveNotificationsDesc: 'Nhận cảnh báo về cảm biến',
    soundAlerts: 'Cảnh báo âm thanh',
    soundAlertsDesc: 'Phát âm thanh khi có cảnh báo',
    autoRefresh: 'Tự động làm mới',
    autoRefreshDesc: 'Cập nhật dữ liệu tự động',
    selectLanguage: 'Chọn ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    theme: 'Giao diện',
    lightMode: 'Sáng',
    systemMode: 'Hệ thống',
    darkMode: 'Chế độ tối',
    darkModeAuto: 'Tự động',
    darkModeLight: 'Sáng',
    darkModeDark: 'Tối',
    language: 'Ngôn ngữ',
    languageDesc: 'Chọn ngôn ngữ hiển thị',
    clearCache: 'Xóa bộ nhớ đệm',
    clearCacheDesc: 'Xóa dữ liệu đã lưu',
    clearCacheTitle: 'Xóa bộ nhớ đệm',
    clearCacheMessage: 'Bạn có chắc muốn xóa tất cả dữ liệu đã lưu?',
    clearCacheSuccess: 'Đã xóa bộ nhớ đệm thành công',
    clearCacheError: 'Lỗi khi xóa bộ nhớ đệm',
    aboutApp: 'Về ứng dụng',
    aboutAppTitle: 'ShrimpTech',
    aboutAppMessage: 'Phiên bản 1.0.0\nHệ thống quản lý nuôi tôm thông minh',
    version: 'Phiên bản 1.0.0',
    firebaseConfig: 'Cấu hình Firebase',
    firebase: 'Firebase',
    selectFirebase: 'Chọn Firebase',
    switchedToFirebase: 'Đã chuyển sang Firebase',
    switchFirebaseError: 'Lỗi khi chuyển Firebase',
    lastUpdate: 'Cập nhật lần cuối',
    selectTheme: 'Chọn giao diện',
    ok: 'OK',
    primaryBackground: '#E3F2FD',
  },
  en: {
    // Common
    appName: 'ShrimpTech',
    appDescription: 'Smart Shrimp Farming Management System',
    welcome: 'Welcome',
    welcomeMessage: 'Technology solutions for aquaculture',
    
    // Tabs
    home: 'Home',
    control: 'Control',
    statistics: 'Statistics',
    notifications: 'Notifications',
    settings: 'Settings',
    explore: 'Explore',
    
    // Devices
    autoFeeder: 'Auto Feeder',
    siphonPump: 'Siphon Pump',
    'waterPump-In': 'Water Pump In',
    'waterPump-Out': 'Water Pump Out',
    oxygenPump: 'Oxygen Pump',
    oxygenFan: 'Oxygen Fan',
    electrolyzer: 'Electrolyzer',
    lightingLamp: 'Lighting Lamp',
    
    // Sensors
    temperature: 'Temperature',
    ph: 'pH',
    turbidity: 'Turbidity',
    dissolvedOxygen: 'Dissolved Oxygen',
    tds: 'TDS',
    waterLevel: 'Water Level',
    ch4: 'CH4',
    h2s: 'H2S',
    nh3: 'NH3',
    no2: 'NO2',
    
    // Status
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting',
    active: 'Active',
    inactive: 'Inactive',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    
    // Actions
    turnOn: 'Turn On',
    turnOff: 'Turn Off',
    refresh: 'Refresh',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    
    // Schedule
    schedule: 'Schedule',
    timeOn: 'Time On',
    timeOff: 'Time Off',
    enabled: 'Enabled',
    disabled: 'Disabled',
    
    // Voice Control
    voiceControl: 'Voice Control',
    listening: 'Listening...',
    speaking: 'Speaking...',
    say: 'Say',
    recognized: 'Recognized',
    
    // Tab titles
    monitoring: 'Monitoring',
    controlTitle: 'Control',
    statisticsTitle: 'Statistics',
    notificationTitle: 'Notifications',
    
    // Control Tab
    deviceControl: 'Device Control',
    scheduleModal: 'Schedule Settings',
    hourOn: 'Turn On Time',
    hourOff: 'Turn Off Time',
    enableSchedule: 'Enable Schedule',
    exampleCommands: 'Example Commands',
    
    // Settings
    display: 'Display',
    system: 'System',
    information: 'Information',
    receiveNotifications: 'Receive Notifications',
    receiveNotificationsDesc: 'Get alerts about sensors',
    soundAlerts: 'Sound Alerts',
    soundAlertsDesc: 'Play sound when alerts occur',
    autoRefresh: 'Auto Refresh',
    autoRefreshDesc: 'Automatically update data',
    selectLanguage: 'Select Language',
    vietnamese: 'Vietnamese',
    english: 'English',
    theme: 'Theme',
    lightMode: 'Light',
    systemMode: 'System',
    darkMode: 'Dark Mode',
    darkModeAuto: 'Auto',
    darkModeLight: 'Light',
    darkModeDark: 'Dark',
    language: 'Language',
    languageDesc: 'Select display language',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Delete saved data',
    clearCacheTitle: 'Clear Cache',
    clearCacheMessage: 'Are you sure you want to delete all saved data?',
    clearCacheSuccess: 'Cache cleared successfully',
    clearCacheError: 'Error clearing cache',
    aboutApp: 'About App',
    aboutAppTitle: 'ShrimpTech',
    aboutAppMessage: 'Version 1.0.0\nSmart Shrimp Farming Management System',
    version: 'Version 1.0.0',
    firebaseConfig: 'Firebase Configuration',
    firebase: 'Firebase',
    selectFirebase: 'Select Firebase',
    switchedToFirebase: 'Switched to Firebase',
    switchFirebaseError: 'Error switching Firebase',
    lastUpdate: 'Last Update',
    selectTheme: 'Select Theme',
    ok: 'OK',
    primaryBackground: '#E3F2FD',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('language');
        if (saved === 'vi' || saved === 'en') {
          setLanguageState(saved);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
