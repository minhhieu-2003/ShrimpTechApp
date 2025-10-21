// Sensor configurations and thresholds

export interface SensorConfig {
  id: string;
  name: string;
  nameEn: string;
  path: string;
  unit: string;
  icon: string;
  color: string;
  min: number;
  max: number;
  description: string;
  descriptionEn: string;
}

export const WATER_SENSORS: SensorConfig[] = [
  {
    id: 'temperature',
    name: 'Nhiệt độ nước',
    nameEn: 'Water Temperature',
    path: 'sensors/water/temp',
    unit: '°C',
    icon: '🌡️',
    color: '#f44336',
    min: 26,
    max: 32,
    description: 'Nhiệt độ nước ao',
    descriptionEn: 'Pond water temperature',
  },
  {
    id: 'ph',
    name: 'Độ pH',
    nameEn: 'pH Level',
    path: 'sensors/water/ph',
    unit: 'pH',
    icon: '🧪',
    color: '#9c27b0',
    min: 7.0,
    max: 8.5,
    description: 'Độ pH của nước',
    descriptionEn: 'Water pH level',
  },
  {
    id: 'turbidity',
    name: 'Độ đục',
    nameEn: 'Turbidity',
    path: 'sensors/water/turbidity',
    unit: 'NTU',
    icon: '💧',
    color: '#03a9f4',
    min: 20,
    max: 60,
    description: 'Độ đục của nước',
    descriptionEn: 'Water turbidity',
  },
  {
    id: 'dissolvedOxygen',
    name: 'Oxy hòa tan',
    nameEn: 'Dissolved Oxygen',
    path: 'sensors/water/dissolved_oxygen',
    unit: 'mg/L',
    icon: '🫧',
    color: '#00bcd4',
    min: 4.0,
    max: 8.0,
    description: 'Lượng oxy hòa tan trong nước',
    descriptionEn: 'Dissolved oxygen in water',
  },
  {
    id: 'tds',
    name: 'TDS',
    nameEn: 'Total Dissolved Solids',
    path: 'sensors/water/tds',
    unit: 'ppm',
    icon: '📊',
    color: '#009688',
    min: 10,
    max: 30,
    description: 'Tổng chất rắn hòa tan',
    descriptionEn: 'Total dissolved solids',
  },
  {
    id: 'waterLevel',
    name: 'Mực nước',
    nameEn: 'Water Level',
    path: 'sensors/water/level',
    unit: 'cm',
    icon: '📏',
    color: '#2196f3',
    min: 80,
    max: 150,
    description: 'Mực nước trong ao',
    descriptionEn: 'Water level in pond',
  },
];

export const GAS_SENSORS: SensorConfig[] = [
  {
    id: 'ch4',
    name: 'CH4',
    nameEn: 'Methane',
    path: 'sensors/gas/ch4',
    unit: 'ppm',
    icon: '💨',
    color: '#ff5722',
    min: 0,
    max: 100,
    description: 'Nồng độ khí metan',
    descriptionEn: 'Methane concentration',
  },
  {
    id: 'h2s',
    name: 'H2S',
    nameEn: 'Hydrogen Sulfide',
    path: 'sensors/gas/h2s',
    unit: 'ppm',
    icon: '☠️',
    color: '#795548',
    min: 0,
    max: 0.05,
    description: 'Nồng độ khí hydro sulfide',
    descriptionEn: 'Hydrogen sulfide concentration',
  },
  {
    id: 'nh3',
    name: 'NH3',
    nameEn: 'Ammonia',
    path: 'sensors/gas/nh3',
    unit: 'ppm',
    icon: '🧫',
    color: '#607d8b',
    min: 0,
    max: 0.3,
    description: 'Nồng độ amoniac',
    descriptionEn: 'Ammonia concentration',
  },
  {
    id: 'no2',
    name: 'NO2',
    nameEn: 'Nitrite',
    path: 'sensors/gas/no2',
    unit: 'ppm',
    icon: '🔬',
    color: '#9e9e9e',
    min: 0,
    max: 0.1,
    description: 'Nồng độ nitrite',
    descriptionEn: 'Nitrite concentration',
  },
];

export const ALL_SENSORS = [...WATER_SENSORS, ...GAS_SENSORS];

export const getSensorById = (id: string): SensorConfig | undefined => {
  return ALL_SENSORS.find(sensor => sensor.id === id);
};

export const getSensorByPath = (path: string): SensorConfig | undefined => {
  return ALL_SENSORS.find(sensor => sensor.path === path);
};
