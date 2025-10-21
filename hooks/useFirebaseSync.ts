import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

interface SensorData {
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
  };
}

export function useSensorData() {
  const { currentDatabase } = useFirebaseConfig();
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!currentDatabase) {
      setLoading(false);
      return;
    }

    const dataRef = ref(currentDatabase, 'sensors');
    
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
          setIsOnline(true);
          setLastUpdate(new Date());
          setError(null);
        } else {
          setData(null);
          setIsOnline(false);
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsOnline(false);
        setLoading(false);
      }
    );

    return () => {
      off(dataRef);
    };
  }, [currentDatabase]);

  return { data, loading, error, isOnline, lastUpdate };
}

export function useDeviceData() {
  const { currentDatabase } = useFirebaseConfig();
  const [devices, setDevices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDatabase) {
      setLoading(false);
      return;
    }

    const devicesRef = ref(currentDatabase, 'devices');
    
    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setDevices(snapshot.val());
          setError(null);
        } else {
          setDevices({});
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      off(devicesRef);
    };
  }, [currentDatabase]);

  return { devices, loading, error };
}
