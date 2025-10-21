import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FirebaseConfig {
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

interface FirebaseConfigContextType {
  currentConfig: FirebaseConfig | null;
  currentDatabase: Database | null;
  isInitializing: boolean;
  switchToFirebase1: () => Promise<void>;
  switchToFirebase2: () => Promise<void>;
}

const FirebaseConfigContext = createContext<FirebaseConfigContextType | undefined>(undefined);

// Firebase configurations
const firebase1Config: FirebaseConfig = {
  id: 'firebase1',
  name: 'IoT System Demo',
  apiKey: 'AIzaSyBzh0tixfgNftb1HnK57EAbTByYdlB3GaA',
  authDomain: 'iot-system-demo.firebaseapp.com',
  databaseURL: 'https://iot-system-demo-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'iot-system-demo',
  storageBucket: 'iot-system-demo.firebasestorage.app',
  messagingSenderId: '474738738909',
  appId: '1:474738738909:web:2b44943061f790cce6fd34',
  measurementId: 'G-Z9RD0PLMBJ'
};

const firebase2Config: FirebaseConfig = {
  id: 'firebase2',
  name: 'NCKH',
  apiKey: 'AIzaSyCicNauI0OCVjFMnEpFBqm0OjfhL8TcUNg',
  authDomain: 'nckh-8e369.firebaseapp.com',
  databaseURL: 'https://nckh-8e369-default-rtdb.firebaseio.com',
  projectId: 'nckh-8e369',
  storageBucket: 'nckh-8e369.firebasestorage.app',
  messagingSenderId: '659653705481',
  appId: '1:659653705481:web:57824d0e70a03fe0f65dd8',
  measurementId: 'G-1M3JG5DMHV'
};

export function FirebaseConfigProvider({ children }: { children: ReactNode }) {
  const [currentConfig, setCurrentConfig] = useState<FirebaseConfig | null>(null);
  const [currentDatabase, setCurrentDatabase] = useState<Database | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeFirebase = async (config: FirebaseConfig) => {
    try {
      // Skip Firebase initialization if using placeholder config
      if (config.apiKey === 'YOUR_API_KEY' || config.apiKey === 'YOUR_API_KEY_2') {
        console.warn('⚠️ Firebase config not set. Using dummy config for testing.');
        setCurrentConfig(config);
        setCurrentDatabase(null);
        await AsyncStorage.setItem('currentFirebaseId', config.id);
        return;
      }
      
      const app = initializeApp(config, config.id);
      const database = getDatabase(app);
      setCurrentConfig(config);
      setCurrentDatabase(database);
      await AsyncStorage.setItem('currentFirebaseId', config.id);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  };

  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const savedId = await AsyncStorage.getItem('currentFirebaseId');
        const config = savedId === 'firebase2' ? firebase2Config : firebase1Config;
        await initializeFirebase(config);
      } catch (error) {
        await initializeFirebase(firebase1Config);
      } finally {
        setIsInitializing(false);
      }
    };
    loadSavedConfig();
  }, []);

  const switchToFirebase1 = async () => {
    setIsInitializing(true);
    await initializeFirebase(firebase1Config);
    setIsInitializing(false);
  };

  const switchToFirebase2 = async () => {
    setIsInitializing(true);
    await initializeFirebase(firebase2Config);
    setIsInitializing(false);
  };

  return (
    <FirebaseConfigContext.Provider value={{
      currentConfig,
      currentDatabase,
      isInitializing,
      switchToFirebase1,
      switchToFirebase2,
    }}>
      {children}
    </FirebaseConfigContext.Provider>
  );
}

export const useFirebaseConfig = () => {
  const context = useContext(FirebaseConfigContext);
  if (!context) {
    throw new Error('useFirebaseConfig must be used within FirebaseConfigProvider');
  }
  return context;
};
