import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    settingsButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
    },
  });

  const HeaderRight = () => (
    <TouchableOpacity 
      style={styles.settingsButton}
      onPress={() => router.push('/(tabs)/SettingsTab')}
    >
      <MaterialCommunityIcons name="cog" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: 80,
          paddingBottom: 10,
          paddingTop: 4,
          paddingHorizontal: 8,
          elevation: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 2,
          gap: 0,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.headerBackground,
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.headerText,
        },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: t('home'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={28} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: t('monitoring'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="monitor-dashboard" size={28} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="ControlTab" 
        options={{ 
          title: t('controlTitle'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="tune" size={28} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: t('statisticsTitle'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={28} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="NotificationTab" 
        options={{ 
          title: t('notificationTitle'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell" size={28} color={color} />
          ),
        }} 
      />
     
      <Tabs.Screen 
        name="SettingsTab" 
        options={{ 
          title: t('settings'),
          href: null, // Ẩn khỏi TabBar
        }} 
      />
    </Tabs>
  );
}
