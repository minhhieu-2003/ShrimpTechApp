# ShrimpTech App - Hướng dẫn sử dụng

## Cấu trúc dự án

```
ShrimpTechApp/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/              # Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx        # Home tab
│       ├── home.tsx
│       ├── ControlTab.tsx   # Control tab
│       ├── explore.tsx      # Explore tab
│       ├── NotificationTab.tsx
│       └── SettingsTab.tsx
├── components/              # Reusable components
│   ├── ui/                 # UI components
│   └── ...
├── constants/              # Constants and configs
│   ├── devices.ts         # Device configurations
│   ├── sensors.ts         # Sensor configurations
│   ├── config.ts          # App configuration
│   └── theme.ts           # Theme configuration
├── contexts/               # React contexts
│   ├── FirebaseConfigContext.tsx
│   ├── LanguageContext.tsx
│   ├── ThemeContext.tsx
│   ├── AppProviders.tsx
│   └── index.ts
├── hooks/                  # Custom hooks
│   ├── useFirebaseSync.ts
│   ├── useDeviceControl.ts
│   ├── useVoiceControl.ts
│   ├── useESP32Schedule.ts
│   └── index.ts
├── types/                  # TypeScript types
│   └── index.ts
├── utils/                  # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── index.ts
└── package.json
```

## Các file đã tạo

### 1. Contexts
- **FirebaseConfigContext.tsx**: Quản lý kết nối Firebase và chuyển đổi giữa các cấu hình
- **LanguageContext.tsx**: Quản lý đa ngôn ngữ (Tiếng Việt/English)
- **ThemeContext.tsx**: Quản lý theme (Light/Dark/System)
- **AppProviders.tsx**: Kết hợp tất cả providers

### 2. Hooks
- **useFirebaseSync.ts**: Đồng bộ dữ liệu từ Firebase (sensors, devices)
- **useDeviceControl.ts**: Điều khiển thiết bị (bật/tắt)
- **useVoiceControl.ts**: Điều khiển giọng nói (placeholder, cần implement thực tế)
- **useESP32Schedule.ts**: Quản lý lịch trình cho thiết bị

### 3. Constants
- **devices.ts**: Cấu hình 8 thiết bị (máy cho ăn, bơm nước, đèn, v.v.)
- **sensors.ts**: Cấu hình sensors (nhiệt độ, pH, oxy, v.v.)
- **config.ts**: Cấu hình chung của app

### 4. Utils
- **formatters.ts**: Các hàm format dữ liệu (nhiệt độ, pH, thời gian, v.v.)
- **validators.ts**: Các hàm validate dữ liệu

### 5. Types
- **index.ts**: Tất cả TypeScript types/interfaces

## Cấu hình Firebase

Mở file `contexts/FirebaseConfigContext.tsx` và cập nhật thông tin Firebase của bạn:

```typescript
const firebase1Config: FirebaseConfig = {
  id: 'firebase1',
  name: 'IoT Demo',
  apiKey: 'YOUR_API_KEY',            // Thay đổi
  authDomain: 'YOUR_AUTH_DOMAIN',    // Thay đổi
  databaseURL: 'YOUR_DATABASE_URL',  // Thay đổi
  projectId: 'YOUR_PROJECT_ID',      // Thay đổi
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

## Sử dụng trong Components

### 1. Wrap app với AppProviders

```typescript
import { AppProviders } from '@/contexts/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      {/* Your app content */}
    </AppProviders>
  );
}
```

### 2. Sử dụng hooks

```typescript
import { useLanguage } from '@/contexts';
import { useDeviceControl } from '@/hooks';

function MyComponent() {
  const { t } = useLanguage();
  const { devices, deviceStates, controlDevice } = useDeviceControl();
  
  const handleToggle = async (deviceId: string) => {
    const success = await controlDevice(deviceId, !deviceStates[deviceId]);
    if (success) {
      console.log('Device toggled successfully');
    }
  };
  
  return (
    <View>
      <Text>{t('home')}</Text>
    </View>
  );
}
```

## Dependencies đã cài đặt

```bash
npm install firebase @react-native-async-storage/async-storage
```

## Các bước tiếp theo

1. ✅ Cập nhật Firebase configuration
2. ⬜ Implement các screen trong `app/(tabs)/`
3. ⬜ Tạo các components UI cần thiết
4. ⬜ Implement speech recognition (cho useVoiceControl)
5. ⬜ Thêm biểu đồ thống kê
6. ⬜ Implement notifications
7. ⬜ Testing và debugging

## Lưu ý

- Tất cả các file đều có TypeScript types đầy đủ
- Contexts được wrap theo thứ tự: Firebase → Language → Theme
- Hooks tự động đồng bộ dữ liệu real-time từ Firebase
- Support cả 2 cấu hình Firebase và có thể switch giữa chúng

## Support

Nếu cần thêm tính năng hoặc sửa lỗi, hãy cho tôi biết!
