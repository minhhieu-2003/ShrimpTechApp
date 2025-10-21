// Device configurations

export interface DeviceConfig {
  id: string;
  name: string;
  nameEn: string;
  path: string;
  icon: string;
  color: string;
  description: string;
  descriptionEn: string;
}

export const DEVICES: DeviceConfig[] = [
  {
    id: 'autoFeeder',
    name: 'Máy cho ăn tự động',
    nameEn: 'Auto Feeder',
    path: 'devices/autoFeeder',
    icon: '🍽️',
    color: '#4caf50',
    description: 'Tự động cho ăn theo lịch trình',
    descriptionEn: 'Automatic feeding by schedule',
  },
  {
    id: 'siphonPump',
    name: 'Máy siphong',
    nameEn: 'Siphon Pump',
    path: 'devices/siphonPump',
    icon: '💧',
    color: '#2196f3',
    description: 'Hút cặn đáy ao',
    descriptionEn: 'Remove bottom sediment',
  },
  {
    id: 'waterPumpIn',
    name: 'Bơm nước vào',
    nameEn: 'Water Pump In',
    path: 'devices/waterPumpIn',
    icon: '⬇️',
    color: '#03a9f4',
    description: 'Bơm nước vào ao',
    descriptionEn: 'Pump water into pond',
  },
  {
    id: 'waterPumpOut',
    name: 'Bơm nước ra',
    nameEn: 'Water Pump Out',
    path: 'devices/waterPumpOut',
    icon: '⬆️',
    color: '#00bcd4',
    description: 'Xả nước ra khỏi ao',
    descriptionEn: 'Drain water from pond',
  },
  {
    id: 'oxygenPump',
    name: 'Máy bơm oxy',
    nameEn: 'Oxygen Pump',
    path: 'devices/oxygenPump',
    icon: '🫧',
    color: '#009688',
    description: 'Cấp oxy cho ao nuôi',
    descriptionEn: 'Supply oxygen to pond',
  },
  {
    id: 'oxygenFan',
    name: 'Quạt oxy',
    nameEn: 'Oxygen Fan',
    path: 'devices/oxygenFan',
    icon: '🌀',
    color: '#00acc1',
    description: 'Khuấy động nước và cấp oxy',
    descriptionEn: 'Circulate water and supply oxygen',
  },
  {
    id: 'electrolyzer',
    name: 'Máy điện phân',
    nameEn: 'Electrolyzer',
    path: 'devices/electrolyzer',
    icon: '⚡',
    color: '#ffc107',
    description: 'Điện phân nước tạo oxy',
    descriptionEn: 'Electrolyze water to produce oxygen',
  },
  {
    id: 'lightingLamp',
    name: 'Đèn chiếu sáng',
    nameEn: 'Lighting Lamp',
    path: 'devices/lightingLamp',
    icon: '💡',
    color: '#ff9800',
    description: 'Chiếu sáng ao nuôi',
    descriptionEn: 'Illuminate pond',
  },
];

export const getDeviceById = (id: string): DeviceConfig | undefined => {
  return DEVICES.find(device => device.id === id);
};

export const getDeviceByPath = (path: string): DeviceConfig | undefined => {
  return DEVICES.find(device => device.path === path);
};
