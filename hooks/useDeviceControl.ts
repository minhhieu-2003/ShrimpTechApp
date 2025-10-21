import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { off, onValue, ref, set } from 'firebase/database';
import { useCallback, useEffect, useState } from 'react';

interface Device {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export function useDeviceControl() {
  const { currentDatabase, currentConfig } = useFirebaseConfig();
  const [deviceStates, setDeviceStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Define devices for the system
  const devices: Device[] = [
    { id: 'autoFeeder', name: 'Máy cho ăn', path: 'devices/autoFeeder', icon: '🍽️' },
    { id: 'siphonPump', name: 'Máy siphong', path: 'devices/siphonPump', icon: '💧' },
    { id: 'waterPump-In', name: 'Bơm nước vào', path: 'devices/waterPumpIn', icon: '⬇️' },
    { id: 'waterPump-Out', name: 'Bơm nước ra', path: 'devices/waterPumpOut', icon: '⬆️' },
    { id: 'oxygenPump', name: 'Máy bơm oxy', path: 'devices/oxygenPump', icon: '🫧' },
    { id: 'oxygenFan', name: 'Quạt oxy', path: 'devices/oxygenFan', icon: '🌀' },
    { id: 'electrolyzer', name: 'Máy điện phân', path: 'devices/electrolyzer', icon: '⚡' },
    { id: 'lightingLamp', name: 'Đèn chiếu sáng', path: 'devices/lightingLamp', icon: '💡' },
  ];

  useEffect(() => {
    if (!currentDatabase) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to each device's state
    devices.forEach(device => {
      const deviceRef = ref(currentDatabase, device.path);
      const unsubscribe = onValue(deviceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let state = false;
          
          // Parse state based on Firebase configuration
          if (currentConfig?.id === 'firebase1') {
            state = data?.message === 'ON';
          } else {
            state = data === '1' || data === 1 || data === true;
          }
          
          setDeviceStates(prev => ({ ...prev, [device.id]: state }));
        }
      });
      unsubscribers.push(() => off(deviceRef));
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentDatabase, currentConfig]);

  const controlDevice = useCallback(async (deviceId: string, state: boolean): Promise<boolean> => {
    if (!currentDatabase) {
      setError('Database not initialized');
      return false;
    }

    const device = devices.find(d => d.id === deviceId);
    if (!device) {
      setError('Device not found');
      return false;
    }

    try {
      setLoading(prev => ({ ...prev, [deviceId]: true }));
      const deviceRef = ref(currentDatabase, device.path);
      
      // Format data based on Firebase configuration
      let data: any;
      if (currentConfig?.id === 'firebase1') {
        data = { message: state ? 'ON' : 'OFF' };
      } else {
        data = state ? '1' : '0';
      }
      
      await set(deviceRef, data);
      setError(null);
      setLoading(prev => ({ ...prev, [deviceId]: false }));
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(prev => ({ ...prev, [deviceId]: false }));
      return false;
    }
  }, [currentDatabase, currentConfig]);

  const getDeviceState = useCallback((deviceId: string): boolean => {
    return deviceStates[deviceId] || false;
  }, [deviceStates]);

  const isDeviceLoading = useCallback((deviceId: string): boolean => {
    return loading[deviceId] || false;
  }, [loading]);

  const toggleDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    const currentState = getDeviceState(deviceId);
    return await controlDevice(deviceId, !currentState);
  }, [getDeviceState, controlDevice]);

  return {
    devices,
    deviceStates,
    loading,
    error,
    controlDevice,
    getDeviceState,
    isDeviceLoading,
    toggleDevice,
  };
}
