import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface Colors {
  [x: string]: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: Colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: Colors = {
  primary: '#2196f3',
  primaryLight: '#64b5f6',
  primaryDark: '#1976d2',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#e0e0e0',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  tint: '#2196f3',
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: '#2196f3',
  shadow: '#000000',
  surface: '#ffffff',
  // Tab bar colors
  tabBarActive: '#2196f3',
  tabBarInactive: '#999999',
  tabBarBackground: '#ffffff',
  tabBarBorder: '#e0e0e0',
  // Header colors
  headerBackground: '#ffffff',
  headerText: '#000000',
  // Status badge colors  
  statusBadgeBackground: '#f0f0f0',
  statusDotConnected: '#4caf50',
  primaryBackground: '#E3F2FD',
};

const darkColors: Colors = {
  primary: '#64b5f6',
  primaryLight: '#90caf9',
  primaryDark: '#42a5f5',
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  border: '#333333',
  error: '#ef5350',
  success: '#66bb6a',
  warning: '#ffa726',
  info: '#64b5f6',
  tint: '#64b5f6',
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#64b5f6',
  shadow: '#000000',
  surface: '#2a2a2a',
  // Tab bar colors
  tabBarActive: '#64b5f6',
  tabBarInactive: '#666666',
  tabBarBackground: '#1e1e1e',
  tabBarBorder: '#333333',
  // Header colors
  headerBackground: '#1e1e1e',
  headerText: '#ffffff',
  // Status badge colors
  statusBadgeBackground: '#2a2a2a',
  statusDotConnected: '#66bb6a',
  primaryBackground: '#1565C0',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('themeMode');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const getColors = (): Colors => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkColors : lightColors;
    }
    return themeMode === 'dark' ? darkColors : lightColors;
  };

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors: getColors(), isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
