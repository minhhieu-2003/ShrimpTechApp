// src/screens/ControlTab.tsx
import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useESP32Schedule } from '@/hooks/useESP32Schedule';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onValue, ref, set } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface RelayDevice {
  labelKey: string; // Translation key
  icon: any;
  color: string;
  firebaseKey?: string; // Key để lưu trong Firebase Daily
}

/**
 * FIREBASE CONFIGURATION MAPPINGS
 * 
 * Firebase 1 (IoT Demo) - 8 thiết bị:
 * - Path: devices/relay1, devices/relay2, ..., devices/relay8
 * - Data: { message: "ON" | "OFF" }
 * 
 * Firebase 2 (NCKH) - 7 thiết bị:
 * - Path: Control/MRTA, Control/MSP, Control/MAY_BOM_VAO, etc.
 * - Data: "1" | "0" (string hoặc number)
 */

// Firebase IoT Demo (8 thiết bị) - devices/relay1-8 -> {message: "ON/OFF"}
const iotDemoDevices: RelayDevice[] = [
  { labelKey: 'autoFeeder', icon: 'grain', color: '#d84315', firebaseKey: 'MAY_RAI_THUC_AN' },
  { labelKey: 'siphonPump', icon: 'engine', color: '#0288d1', firebaseKey: 'MAY_SIPHONG' },
  { labelKey: 'waterPump-In', icon: 'engine', color: '#0288d1', firebaseKey: 'BOM_NUOC_VAO' },
  { labelKey: 'waterPump-Out', icon: 'engine', color: '#0288d1', firebaseKey: 'BOM_NUOC_RA' },
  { labelKey: 'oxygenPump', icon: 'gas-cylinder', color: '#43a047', firebaseKey: 'OXI' },
  { labelKey: 'oxygenFan', icon: 'fan', color: '#fbc02d', firebaseKey: 'QUAT_OXY' },
  { labelKey: 'electrolyzer', icon: 'water-plus', color: '#8e24aa', firebaseKey: 'MAY_DIEN_PHAN' },
  { labelKey: 'lightingLamp', icon: 'lightbulb-on-outline', color: '#ff9800', firebaseKey: 'DEN_CHIEU_SANG' },
];

// Firebase NCKH (7 thiết bị) - Control/MRTA -> "1/0"
const nckhDevices: RelayDevice[] = [
  { labelKey: 'autoFeeder', icon: 'grain', color: '#d84315', firebaseKey: 'MRTA' },
  { labelKey: 'siphonPump', icon: 'engine', color: '#0288d1', firebaseKey: 'MSP' },
  { labelKey: 'waterPump-In', icon: 'engine', color: '#0288d1', firebaseKey: 'MAY_BOM_VAO' },
  { labelKey: 'waterPump-Out', icon: 'engine', color: '#0288d1', firebaseKey: 'MAY_BOM_RA' },
  { labelKey: 'oxygenPump', icon: 'gas-cylinder', color: '#43a047', firebaseKey: 'OXI' },
  { labelKey: 'oxygenFan', icon: 'fan', color: '#fbc02d', firebaseKey: 'FAN' },
  { labelKey: 'lightingLamp', icon: 'lightbulb-on-outline', color: '#ff9800', firebaseKey: 'LED' },
];

export default function ControlTab() {
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const { currentDatabase, currentConfig } = useFirebaseConfig();
  
  // Chọn device array dựa trên Firebase config
  const relayDevices = currentConfig?.id === 'firebase1' ? iotDemoDevices : nckhDevices;
  const deviceCount = relayDevices.length;
  
  const [relays, setRelays] = useState(Array(deviceCount).fill(false));
  const [scheduleModal, setScheduleModal] = useState({ visible: false, deviceIndex: -1 });

  // Reset relays khi thay đổi Firebase config
  useEffect(() => {
    setRelays(Array(deviceCount).fill(false));
  }, [deviceCount, currentConfig]);

  // Helper functions cho Firebase data handling
  const getFirebasePath = (device: RelayDevice, index: number) => {
    return currentConfig?.id === 'firebase1' 
      ? `devices/relay${index + 1}` 
      : `Control/${device.firebaseKey}`;
  };

  const getDataToSend = (newStatus: boolean) => {
    return currentConfig?.id === 'firebase1'
      ? { message: newStatus ? 'ON' : 'OFF' }
      : (newStatus ? '1' : '0');
  };

  const parseFirebaseStatus = (data: any) => {
    if (currentConfig?.id === 'firebase1') {
      return data.message === 'ON';
    } else {
      return data === '1' || data === 1;
    }
  };
  const [tempSchedule, setTempSchedule] = useState({
    hour_on: '',
    minute_on: '',
    hour_off: '',
    minute_off: '',
    enabled: false,
  });

  const {
    schedules,
    loading: scheduleLoading,
    error: scheduleError,
    updateDeviceSchedule,
    getDeviceSchedule,
    formatScheduleTime,
  } = useESP32Schedule();

  const {
    isListening,
    isSpeaking,
    recognizedText,
    error,
    debugInfo,
    isAvailable,
    speak,
    startListening,
    stopListening,
    processVoiceInput,
    registerCommand,
    clearCommands,
    createDefaultCommands,
    controlDeviceByConfig,
    getCommandsStatus,
    setRecognizedText,
    initializeVoice,
    cleanup,
  } = useVoiceControl();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [commandsRefreshTrigger, setCommandsRefreshTrigger] = useState(0);

  const styles = createStyles(colors);

  const animationsRef = useRef(
    Array(Math.max(iotDemoDevices.length, nckhDevices.length)).fill(null).map(() => ({
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
      blink: new Animated.Value(1),
      shake: new Animated.Value(0),
    }))
  );

  // Đồng bộ trạng thái relay từ Firebase
  useEffect(() => {
    if (!currentDatabase || !currentConfig) return;

    const unsubscribers: Array<() => void> = [];

    relayDevices.forEach((device, index) => {
      // Safety check: ensure device exists and has firebaseKey
      if (!device || !device.firebaseKey) return;

      const firebasePath = getFirebasePath(device, index);
      const relayRef = ref(currentDatabase, firebasePath);
      
      const unsubscribe = onValue(relayRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const status = parseFirebaseStatus(data);

          setRelays((prev) => {
            const newRelays = [...prev];
            const previousStatus = prev[index];
            
            // Safety check: ensure index is within bounds
            if (index < newRelays.length) {
              newRelays[index] = status;
              
              // CHỈ xử lý animation khi trạng thái THỰC SỰ THAY ĐỔI từ Firebase
              // (không phải từ optimistic update)
              if (status !== previousStatus) {
                console.log(`🔄 Firebase sync: Device ${index} changed ${previousStatus} → ${status}`);
                if (status) {
                  setTimeout(() => startDeviceAnimation(index), 50);
                } else {
                  setTimeout(() => stopDeviceAnimation(index), 50);
                }
              }
            }
            return newRelays;
          });
        }
      });
      unsubscribers.push(() => unsubscribe());
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [currentDatabase, currentConfig, relayDevices]);

  // Initialize voice recognition on component mount
  useEffect(() => {
    initializeVoice();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initializeVoice, cleanup]);

  // Debug useEffect to monitor voice control readiness
  useEffect(() => {
    const debugTimer = setTimeout(() => {
      console.log('🔍 Voice Control Debug Status:');
      console.log(`  - Language: ${language}`);
      console.log(`  - Database connected: ${!!currentDatabase}`);
      console.log(`  - Config: ${currentConfig?.name || 'None'}`);
      console.log(`  - Device count: ${relayDevices.length}`);
      console.log(`  - Voice available: ${isAvailable}`);
      console.log(`  - Currently listening: ${isListening}`);
    }, 2000); // Check after 2 seconds

    return () => clearTimeout(debugTimer);
  }, [language, currentDatabase, currentConfig, relayDevices.length, isAvailable, isListening]);

  // Animation function for devices
  const startDeviceAnimation = (index: number) => {
    // Safety checks
    const anim = animationsRef.current[index];
    const device = relayDevices[index];
    
    if (!anim || !device) return;
    
    // Stop any existing animations first
    anim.rotate.stopAnimation();
    anim.blink.stopAnimation();
    anim.shake.stopAnimation();
    
    // Reset values
    anim.rotate.setValue(0);
    anim.blink.setValue(1);
    anim.shake.setValue(0);

    console.log(`🎬 Starting animation for device ${index} (${device.icon})`);

    switch (device.icon) {
      case 'engine':
      case 'gas-cylinder':
        // Blink animation for pumps and gas cylinder
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.blink, { toValue: 0.3, duration: 400, useNativeDriver: true }),
            Animated.timing(anim.blink, { toValue: 1, duration: 400, useNativeDriver: true }),
          ])
        ).start();
        console.log(`✅ Blink animation started for device ${index}`);
        break;
      case 'fan':
        // Rotate animation for fan
        Animated.loop(
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ).start();
        console.log(`✅ Rotate animation started for device ${index}`);
        break;
      case 'lightbulb-on-outline':
        // Pulse animation for light
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.blink, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
            Animated.timing(anim.blink, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
        console.log(`✅ Pulse animation started for light ${index}`);
        break;
      case 'grain':
        // Shake animation for feeder
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.shake, { toValue: 5, duration: 100, useNativeDriver: true }),
            Animated.timing(anim.shake, { toValue: -5, duration: 100, useNativeDriver: true }),
            Animated.timing(anim.shake, { toValue: 0, duration: 100, useNativeDriver: true }),
          ])
        ).start();
        console.log(`✅ Shake animation started for feeder ${index}`);
        break;
      case 'water-plus':
        // Blink for electrolyzer
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.blink, { toValue: 0.4, duration: 600, useNativeDriver: true }),
            Animated.timing(anim.blink, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();
        console.log(`✅ Blink animation started for electrolyzer ${index}`);
        break;
      default:
        console.log(`⚠️ No animation defined for icon: ${device.icon}`);
    }
  };

  // Stop animation function
  const stopDeviceAnimation = (index: number) => {
    const anim = animationsRef.current[index];
    if (!anim) return;
    
    console.log(`🛑 Stopping animation for device ${index}`);
    
    // Stop all animations
    anim.rotate.stopAnimation();
    anim.blink.stopAnimation();
    anim.shake.stopAnimation();
    
    // Reset to default values
    Animated.parallel([
      Animated.timing(anim.rotate, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(anim.blink, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(anim.shake, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  // Register voice commands for device control
  useEffect(() => {
    console.log(`🎤 Registering voice commands for language: ${language} (trigger: ${commandsRefreshTrigger})`);
    clearCommands();

    // Vietnamese commands
    const viCommands = [
      // Máy rải thức ăn (Auto Feeder) - index 0
      { keywords: ['bật máy cho ăn', 'mở máy cho ăn', 'máy cho ăn bật', 'máy cho ăn mở', 'cho ăn bật', 'cho ăn mở', 'bật cho ăn', 'mở cho ăn', 'chạy máy cho ăn', 'rải thức ăn bật'], deviceIndex: 0, state: true },
      { keywords: ['tắt máy cho ăn', 'đóng máy cho ăn', 'máy cho ăn tắt', 'máy cho ăn đóng', 'cho ăn tắt', 'cho ăn đóng', 'tắt cho ăn', 'đóng cho ăn', 'dừng cho ăn', 'ngắt máy cho ăn'], deviceIndex: 0, state: false },
      
      // Máy siphong (Siphon Pump) - index 1
      { keywords: ['bật máy siphong', 'mở máy siphong', 'máy siphong bật', 'máy siphong mở', 'chạy máy siphong', 'siphong bật', 'siphong mở', 'bật siphong', 'mở siphong', 'chạy siphong', 'bật xi phong', 'mở xi phong', 'chạy xi phong', 'xi phong bật', 'xi phong mở', 'xi phong'], deviceIndex: 1, state: true },
      { keywords: ['tắt máy siphong', 'đóng máy siphong', 'máy siphong tắt', 'máy siphong đóng', 'dừng máy siphong', 'siphong tắt', 'siphong đóng', 'tắt siphong', 'đóng siphong', 'dừng siphong', 'ngắt siphong', 'tắt xi phong', 'đóng xi phong', 'dừng xi phong', 'xi phong tắt', 'xi phong đóng'], deviceIndex: 1, state: false },
      
      // Bơm nước vào (Water Pump In) - index 2
      { keywords: ['bật bơm vào', 'mở bơm vào', 'bơm nước vào'], deviceIndex: 2, state: true },
      { keywords: ['tắt bơm vào', 'dừng bơm vào', 'ngắt bơm vào'], deviceIndex: 2, state: false },
      
      // Bơm nước ra (Water Pump Out) - index 3
      { keywords: ['bật bơm ra', 'mở bơm ra', 'bơm nước ra'], deviceIndex: 3, state: true },
      { keywords: ['tắt bơm ra', 'dừng bơm ra', 'ngắt bơm ra'], deviceIndex: 3, state: false },
      
      // Máy oxy (Oxygen Pump) - index 4
      { keywords: ['bật oxy', 'mở oxy', 'bơm oxy bật', 'bơm oxy mở', 'chạy oxy', 'oxy bật', 'oxy mở', 'bật oxi', 'mở oxi', 'chạy oxi'], deviceIndex: 4, state: true },
      { keywords: ['tắt oxy', 'đóng oxy', 'bơm oxy tắt', 'bơm oxy đóng', 'dừng oxy', 'ngắt oxy', 'oxy tắt', 'oxy đóng', 'tắt oxi', 'đóng oxi', 'ngắt oxi'], deviceIndex: 4, state: false },
      
      // Quạt oxy (Oxygen Fan) - index 5
      { keywords: ['bật quạt oxy', 'mở quạt oxy', 'quạt oxy bật', 'quạt oxy mở', 'chạy quạt oxy', 'bật quạt oxi', 'mở quạt oxi', 'quạt oxi bật', 'quạt oxi mở', 'chạy quạt oxi'], deviceIndex: 5, state: true },
      { keywords: ['tắt quạt oxy', 'đóng quạt oxy', 'quạt oxy tắt', 'quạt oxy đóng', 'dừng quạt oxy', 'ngắt quạt oxy', 'tắt quạt oxi', 'đóng quạt oxi', 'quạt oxi tắt', 'quạt oxi đóng', 'dừng quạt oxi', 'ngắt quạt oxi'], deviceIndex: 5, state: false },
      
      // Máy điện phân (Electrolyzer) - index 6
      { keywords: ['bật máy điện phân', 'mở điện phân', 'chạy điện phân'], deviceIndex: 6, state: true },
      { keywords: ['tắt máy điện phân', 'dừng điện phân', 'ngắt điện phân'], deviceIndex: 6, state: false },
      
      // Đèn chiếu sáng (Lighting Lamp) - index 7
      { keywords: ['bật đèn', 'mở đèn', 'sáng đèn', 'bật chiếu sáng', 'đèn bật', 'đèn mở', 'đèn sáng', 'bật gen', 'mở gen'], deviceIndex: 7, state: true },
      { keywords: ['tắt đèn', 'đóng đèn', 'dừng đèn', 'ngắt đèn', 'tắt chiếu sáng', 'đèn tắt', 'đèn đóng', 'tắt gen', 'đóng gen'], deviceIndex: 7, state: false },
    ];

    // English commands
    const enCommands = [
      // Auto Feeder - index 0
      { keywords: ['turn on feeder', 'start feeder', 'feed fish', 'start feeding'], deviceIndex: 0, state: true },
      { keywords: ['turn off feeder', 'stop feeder', 'stop feeding'], deviceIndex: 0, state: false },
      
      // Siphon Pump - index 1
      { keywords: ['turn on siphon', 'start siphon', 'siphon on'], deviceIndex: 1, state: true },
      { keywords: ['turn off siphon', 'stop siphon', 'siphon off'], deviceIndex: 1, state: false },
      
      // Water Pump In - index 2
      { keywords: ['turn on pump in', 'start pump in', 'water in'], deviceIndex: 2, state: true },
      { keywords: ['turn off pump in', 'stop pump in'], deviceIndex: 2, state: false },
      
      // Water Pump Out - index 3
      { keywords: ['turn on pump out', 'start pump out', 'water out'], deviceIndex: 3, state: true },
      { keywords: ['turn off pump out', 'stop pump out'], deviceIndex: 3, state: false },
      
      // Oxygen Pump - index 4
      { keywords: ['turn on oxygen', 'start oxygen', 'oxygen on'], deviceIndex: 4, state: true },
      { keywords: ['turn off oxygen', 'stop oxygen', 'oxygen off'], deviceIndex: 4, state: false },
      
      // Oxygen Fan - index 5
      { keywords: ['turn on fan', 'start fan', 'fan on'], deviceIndex: 5, state: true },
      { keywords: ['turn off fan', 'stop fan', 'fan off'], deviceIndex: 5, state: false },
      
      // Electrolyzer - index 6
      { keywords: ['turn on electrolyzer', 'start electrolyzer'], deviceIndex: 6, state: true },
      { keywords: ['turn off electrolyzer', 'stop electrolyzer'], deviceIndex: 6, state: false },
      
      // Lighting Lamp - index 7
      { keywords: ['turn on light', 'light on', 'lights on'], deviceIndex: 7, state: true },
      { keywords: ['turn off light', 'light off', 'lights off'], deviceIndex: 7, state: false },
    ];

    const commandsToUse = language === 'vi' ? viCommands : enCommands;
    commandsToUse.forEach((cmd, cmdIndex) => {
      registerCommand({
        command: cmd.keywords[0],
        variations: cmd.keywords.slice(1),
        action: async () => {
          // Thực hiện thao tác bật/tắt thiết bị thực tế và phát âm thanh xác nhận
          const index = cmd.deviceIndex;
          const device = relayDevices[index];
          if (!currentDatabase || !device?.firebaseKey) {
            await speak(language === 'vi' ? 'Không thể điều khiển thiết bị' : 'Cannot control device');
            return;
          }
          const newStatus = cmd.state;
          const firebasePath = getFirebasePath(device, index);
          const dataToSend = getDataToSend(newStatus);
          try {
            const success = await controlDeviceByConfig(firebasePath, dataToSend);
            if (success) {
              await speak(newStatus
                ? (language === 'vi' ? 'Đã bật thiết bị' : 'Device turned on')
                : (language === 'vi' ? 'Đã tắt thiết bị' : 'Device turned off')
              );
            } else {
              await speak(language === 'vi' ? 'Thao tác thất bại' : 'Action failed');
            }
          } catch {
            await speak(language === 'vi' ? 'Lỗi khi điều khiển thiết bị' : 'Error controlling device');
          }
        },
      });
      console.log(`✅ Registered command: ${cmd.keywords[0]} (${cmd.state ? 'ON' : 'OFF'})`);
    });
    console.log(`✅ Registered ${commandsToUse.length} voice commands total`);
  }, [language, currentConfig?.id, registerCommand, relayDevices, currentDatabase, clearCommands, speak, getFirebasePath, getDataToSend, commandsRefreshTrigger]);

  const toggleRelay = (index: number) => {
    console.log(`🔍 toggleRelay called for index ${index}`);
    const device = relayDevices[index];
    
    console.log(`🔍 Device label: ${device?.labelKey}, firebaseKey: ${device?.firebaseKey}`);
    console.log(`🔍 currentDatabase exists: ${!!currentDatabase}`);
    console.log(`🔍 index < relays.length: ${index < relays.length}`);
    
    // Safety checks
    if (!currentDatabase) {
      console.error(`❌ No database connection`);
      return;
    }
    if (!device) {
      console.error(`❌ No device at index ${index}`);
      return;
    }
    if (!device.firebaseKey) {
      console.error(`❌ No firebaseKey for device ${index}`);
      return;
    }
    if (index >= relays.length) {
      console.error(`❌ Index ${index} >= relays.length ${relays.length}`);
      return;
    }

    const newStatus = !relays[index];
    const firebasePath = getFirebasePath(device, index);
    const relayRef = ref(currentDatabase, firebasePath);
    const dataToSend = getDataToSend(newStatus);

    console.log(`🎯 Toggle relay ${index}: ${device.firebaseKey} -> ${newStatus ? 'ON' : 'OFF'}`);
    console.log(`📍 Firebase path: ${firebasePath}`);
    console.log(`📦 Data to send: ${JSON.stringify(dataToSend)}`);

    // CẬP NHẬT UI NGAY LẬP TỨC (Optimistic Update)
    const updatedRelays = [...relays];
    updatedRelays[index] = newStatus;
    setRelays(updatedRelays);

    // Start/Stop animation ngay
    if (newStatus) {
      console.log(`🎬 Starting animation immediately for device ${index}`);
      startDeviceAnimation(index);
    } else {
      console.log(`🛑 Stopping animation immediately for device ${index}`);
      stopDeviceAnimation(index);
    }

    // Sau đó gửi lên Firebase
    set(relayRef, dataToSend)
      .then(() => {
        console.log(`✅ Firebase updated successfully: ${device.firebaseKey}`);
      })
      .catch((error) => {
        console.error(`❌ Lỗi điều khiển ${device.firebaseKey}:`, error);
        // Rollback nếu lỗi
        const rollbackRelays = [...relays];
        rollbackRelays[index] = !newStatus;
        setRelays(rollbackRelays);
        
        // Rollback animation
        if (!newStatus) {
          startDeviceAnimation(index);
        } else {
          stopDeviceAnimation(index);
        }
      });
  };

  const animatePress = (index: number) => {
    console.log(`👆 Pressing device ${index}`);
    const device = relayDevices[index];
    console.log(`🔍 Device: ${device?.labelKey}, firebaseKey: ${device?.firebaseKey}`);
    console.log(`🔍 currentDatabase exists: ${!!currentDatabase}`);
    
    const anim = animationsRef.current[index];
    
    // Safety check
    if (!anim) {
      console.log(`❌ No animation ref for device ${index}`);
      return;
    }
    
    console.log(`✅ Animation ref exists, calling toggleRelay(${index})`);
    
    // Bounce animation khi nhấn
    Animated.sequence([
      Animated.timing(anim.scale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(anim.scale, { 
        toValue: 1, 
        friction: 3,
        tension: 40,
        useNativeDriver: true 
      }),
    ]).start();
    
    // Toggle ngay lập tức (không đợi animation)
    toggleRelay(index);
  };

  // Mở modal lịch trình
  const openScheduleModal = (index: number) => {
    const device = relayDevices[index];
    
    // Safety check
    if (!device || !device.firebaseKey) return;

    const currentSchedule = getDeviceSchedule(device.firebaseKey);
    if (currentSchedule) {
      setTempSchedule(currentSchedule);
    } else {
      setTempSchedule({
        hour_on: '06',
        minute_on: '00',
        hour_off: '18',
        minute_off: '00',
        enabled: false,
      });
    }
    setScheduleModal({ visible: true, deviceIndex: index });
  };

  // Lưu lịch trình
  const saveSchedule = async () => {
    const device = relayDevices[scheduleModal.deviceIndex];
    
    // Safety check
    if (!device || !device.firebaseKey) return;

    const success = await updateDeviceSchedule(device.firebaseKey, tempSchedule);
    if (success) {
      setScheduleModal({ visible: false, deviceIndex: -1 });
    }
  };

  return (

    <ScrollView contentContainerStyle={styles.container}>
      {/* Firebase Info Header */}
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="remote" size={32} color={colors.primary} />
        <Text style={styles.headerText}>{t('deviceControl')}</Text>
        <View style={styles.firebaseInfo}>
          <MaterialCommunityIcons name="firebase" size={16} color="#FFA000" />
          <Text style={styles.firebaseText}>
            {currentConfig?.name || 'Loading...'} • {relays.filter(Boolean).length}/{relayDevices.length} {t('active')}
          </Text>
        </View>
      </View>

      {/* Voice Control Button */}
      <TouchableOpacity 
        style={styles.voiceButton} 
        onPress={() => {
          setShowVoiceModal(true);
          setRecognizedText('');
        }}
      >
        <MaterialCommunityIcons name="microphone" size={28} color="#fff" />
        <Text style={styles.voiceButtonText}>{t('voiceControl')}</Text>
      </TouchableOpacity>

      {/* Device Grid */}
      <View style={styles.gridContainer}>
        {relays.map((status, index) => {
          const device = relayDevices[index];
          if (!device) return null;
          const anim = animationsRef.current[index];
          if (!anim) return null;
          const spin = anim.rotate.interpolate({
            inputRange: [0, 0.5],
            outputRange: ['0deg', '180deg'],
          });
          // Get schedule for this device
          const schedule = getDeviceSchedule(device.firebaseKey ?? String(index));
          // Build transform array without empty objects
          const transformArr = [
            { scale: anim.scale },
            ...(device.icon === 'fan' ? [{ rotate: spin }] : []),
            ...(device.icon === 'grain' ? [{ translateX: anim.shake }] : []),
          ];
          return (
            <View key={device.firebaseKey || index} style={[styles.card, status ? styles.cardOn : styles.cardOff]}>
              {/* Device Icon */}
              <Animated.View
                style={{
                  transform: transformArr,
                  opacity: device.icon === 'engine' || device.icon === 'gas-cylinder' || device.icon === 'water-plus' || device.icon === 'lightbulb-on-outline' ? anim.blink : 1,
                }}
              >
                <MaterialCommunityIcons name={device.icon} size={36} color={device.color} />
              </Animated.View>
              {/* Device Label */}
              <Text style={[styles.label, status ? styles.textOn : styles.textOff]}>{t(device.labelKey)}</Text>
              {/* Schedule Info */}
              <Text style={styles.scheduleInfo}>
                {schedule && schedule.enabled
                  ? `⏰ ${formatScheduleTime(schedule.hour_on, schedule.minute_on)} - ${formatScheduleTime(schedule.hour_off, schedule.minute_off)}`
                    : t('noSchedule')}
              </Text>
              {/* Schedule Button */}
              <TouchableOpacity style={styles.scheduleButton} onPress={() => openScheduleModal(index)}>
                  <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.primary} />
                    <Text style={styles.scheduleButtonText}>{t('setSchedule')}</Text>
              </TouchableOpacity>
              {/* Toggle Button */}
              <TouchableOpacity onPress={() => animatePress(index)}>
                <MaterialCommunityIcons name={status ? 'toggle-switch' : 'toggle-switch-off'} size={40} color={status ? colors.primary : colors.border} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Voice Control Modal */}
      {/* ...existing code for modals and other UI... */}

      {/* Voice Control Modal */}
      <Modal
        visible={showVoiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>{t('voiceControl')}</Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
              {isListening && (
                <View style={styles.statusBadge}>
                  <ActivityIndicator size="small" color="#4caf50" />
                  <Text style={styles.statusText}>{t('listening')}</Text>
                </View>
              )}
              {isSpeaking && (
                <View style={styles.statusBadge}>
                  <ActivityIndicator size="small" color="#2196f3" />
                  <Text style={styles.statusText}>{t('speaking')}</Text>
                </View>
              )}
            </View>

            {/* Commands Info */}
            <View style={styles.commandsInfo}>
              <MaterialCommunityIcons name="information" size={16} color={colors.primary} />
              <Text style={styles.commandsInfoText}>
                {getCommandsStatus().total} {language === 'vi' ? 'lệnh đã đăng ký' : 'commands registered'}
              </Text>
            </View>

            {/* Voice Control Button - Centered */}
            <View style={styles.micButtonContainer}>
              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive]}
                disabled={isSpeaking}
                onPress={() => {
                  if (isSpeaking) return; // Đang nói thì không thao tác
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={isListening ? 'microphone-off' : 'microphone'}
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={styles.micHint}>
                {isListening ? (language === 'vi' ? 'Đang nghe...' : 'Listening...') : (language === 'vi' ? 'Nhấn để nói' : 'Tap to speak')}
              </Text>
            </View>

            {/* Test Voice Input - Manual Text Entry */}

            {/* Debug Information */}
            {(debugInfo || error) && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Trạng thái:</Text>
                {debugInfo && <Text style={styles.debugText}>{debugInfo}</Text>}
                {error && <Text style={styles.errorText}>Lỗi: {error}</Text>}
              </View>
            )}

            {/* Example Commands - Simplified */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>{t('exampleCommands')}</Text>
              <View style={styles.exampleGrid}>
                {language === 'vi' ? (
                  <>
                    <Text style={styles.exampleItem}>• "Bật đèn" / "Tắt đèn"</Text>
                    <Text style={styles.exampleItem}>• "Bật máy siphong" / "Tắt siphong"</Text>
                    <Text style={styles.exampleItem}>• "Bật oxy" / "Tắt oxy"</Text>
                    <Text style={styles.exampleItem}>• "Bật máy cho ăn"</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.exampleItem}>• "Turn on light" / "Turn off light"</Text>
                    <Text style={styles.exampleItem}>• "Turn on siphon" / "Turn off siphon"</Text>
                    <Text style={styles.exampleItem}>• "Turn on oxygen" / "Turn off oxygen"</Text>
                    <Text style={styles.exampleItem}>• "Turn on feeder"</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal cài đặt lịch trình */}
      <Modal
        visible={scheduleModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleModal({ visible: false, deviceIndex: -1 })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('scheduleModal')} - {scheduleModal.deviceIndex >= 0 ? t(relayDevices[scheduleModal.deviceIndex].labelKey) : ''}
            </Text>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{t('hourOn')}:</Text>
              <TextInput
                style={styles.timeInput}
                value={tempSchedule.hour_on}
                onChangeText={(text) => setTempSchedule({ ...tempSchedule, hour_on: text })}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="06"
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={tempSchedule.minute_on}
                onChangeText={(text) => setTempSchedule({ ...tempSchedule, minute_on: text })}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{t('hourOff')}:</Text>
              <TextInput
                style={styles.timeInput}
                value={tempSchedule.hour_off}
                onChangeText={(text) => setTempSchedule({ ...tempSchedule, hour_off: text })}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="18"
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={tempSchedule.minute_off}
                onChangeText={(text) => setTempSchedule({ ...tempSchedule, minute_off: text })}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
              />
            </View>

            <TouchableOpacity
              style={styles.enableButton}
              onPress={() => setTempSchedule({ ...tempSchedule, enabled: !tempSchedule.enabled })}
            >
              <MaterialCommunityIcons
                name={tempSchedule.enabled ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={tempSchedule.enabled ? '#4caf50' : '#999'}
              />
              <Text style={styles.enableText}>{t('enableSchedule')}</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setScheduleModal({ visible: false, deviceIndex: -1 })}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSchedule}
              >
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  firebaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  firebaseText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardOn: {
    borderColor: colors.primaryLight,
    borderWidth: 2,
    backgroundColor: colors.primaryLight + '15', // Thêm màu nền nhạt khi bật
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6 // Shadow cao hơn khi bật
  },
  cardOff: {
    borderColor: colors.border,
    borderWidth: 2,
    backgroundColor: colors.card, // Màu nền mặc định khi tắt
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  textOn: {
    color: colors.text,
    fontWeight: 'bold', // Đậm hơn khi bật
  },
  textOff: {
    color: colors.textSecondary,
    fontWeight: '500', // Nhẹ hơn khi tắt
  },
  scheduleInfo: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 6,
  },
  scheduleButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 80,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    width: 60,
    textAlign: 'center',
    backgroundColor: colors.surface,
    color: colors.text,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: colors.text,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  enableText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Voice Control Styles
  voiceButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  voiceModalContent: {
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
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  micButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  micButton: {
    backgroundColor: '#2196f3',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: '#f44336',
  },
  examplesContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  exampleGrid: {
    gap: 4,
  },
  exampleItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Debug styles - simplified
  debugContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 4,
  },
  
  // Test Voice Input Styles
  testInputContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  testInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  testButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  testHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  commandsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  commandsInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  micHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  }
});