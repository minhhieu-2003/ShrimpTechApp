import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSensorData } from '@/hooks/useFirebaseSync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface SensorData {
	TEMPERATURE: number;
	pHvalue: number;
	TurbidityValue: number;
	DOValue: number;
	CH4: number;
	H2S: number;
	NH3: number;
	NO2: number;
	TDS: number;
	density?: number;
}

export default function HomeScreen() {
	const { t } = useLanguage();
	const { colors } = useTheme();
	const { data: systemData, loading, error, isOnline, lastUpdate } = useSensorData();
	const [density, setDensity] = useState<number>(0);

	const styles = createStyles(colors);

	const sensorData: SensorData = {
		TEMPERATURE: systemData?.water.temp || 0,
		pHvalue: systemData?.water.ph || 0,
		TurbidityValue: systemData?.water.turbidity || 0,
		DOValue: systemData?.water.dissolved_oxygen || 0,
		CH4: systemData?.gas.ch4 || 0,
		H2S: systemData?.gas.h2s || 0,
		NH3: systemData?.gas.nh3 || 0,
		NO2: systemData?.gas.no2 || 0,
		TDS: systemData?.water.tds || 0,
		density,
	};

		const sensorIcons: Record<keyof SensorData, keyof typeof MaterialCommunityIcons.glyphMap> = {
		TEMPERATURE: 'thermometer',
		pHvalue: 'water',
		TurbidityValue: 'water-opacity',
		DOValue: 'air-filter',
		CH4: 'fire',
		H2S: 'biohazard',
		NH3: 'chemical-weapon',
		NO2: 'alert-circle',
		TDS: 'test-tube',
		density: 'account-group',
	};

	const sensorLabels: Record<keyof SensorData, string> = {
		TEMPERATURE: t('temperature'),
		pHvalue: t('ph'),
		TurbidityValue: t('turbidity'),
		DOValue: t('dissolvedOxygen'),
		CH4: t('ch4'),
		H2S: t('h2s'),
		NH3: t('nh3'),
		NO2: t('no2'),
		TDS: t('tds'),
		density: t('density'),
	};

	const sensorColors: Record<keyof SensorData, string> = {
		TEMPERATURE: colors.sensorTemp || '#FF5722', // orange
		pHvalue: colors.sensorPh || '#2196F3', // blue
		TurbidityValue: colors.sensorTurbidity || '#795548', // brown
		DOValue: colors.sensorDO || '#4CAF50', // green
		CH4: colors.sensorCH4 || '#FF9800', // amber
		H2S: colors.sensorH2S || '#9C27B0', // purple
		NH3: colors.sensorNH3 || '#673AB7', // deep purple
		NO2: colors.sensorNO2 || '#F44336', // red
		TDS: colors.sensorTDS || '#03A9F4', // light blue
		density: colors.sensorDensity || '#607D8B', // blue grey
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.headerContainer}>
				<Image source={require('@/assets/images/Logo.jpg')} style={styles.logo} />
				<Text style={styles.headerText}>{t('ShrimpTech')}</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
					<Text style={{ fontSize: 16, color: colors.text, marginRight: 8 }}>{t('density')}:</Text>
					<TextInput
						style={{ 
							borderWidth: 1, 
							borderColor: colors.border, 
							borderRadius: 4, 
							padding: 4, 
							width: 80, 
							textAlign: 'center', 
							marginRight: 4,
							color: colors.text,
							backgroundColor: colors.surface
						}}
						keyboardType="numeric"
						value={density.toString()}
						onChangeText={text => setDensity(Number(text.replace(/[^0-9.]/g, '')))}
						placeholder={t('densityUnit')}
						placeholderTextColor={colors.textTertiary}
					/>
					<Text style={{ fontSize: 16, color: colors.text }}>{t('densityUnit')}</Text>
				</View>
				<View style={styles.statusContainer}>
					<View style={[styles.statusDot, { backgroundColor: isOnline ? '#4caf50' : '#f44336' }]} />
					<Text style={styles.statusText}>
						{isOnline ? t('connected') : t('disconnected')}{lastUpdate && ` • ${lastUpdate.toLocaleTimeString('vi-VN')}`}
					</Text>
				</View>
				{error && <Text style={styles.errorText}>⚠️ {error}</Text>}
				{loading && <Text style={styles.loadingText}>🔄 {t('loadingData')}</Text>}
			</View>

			<View style={styles.sensorGrid}>
				{Object.entries(sensorData).map(([key, value]) => (
					<View key={key} style={[styles.sensorCard, { borderColor: sensorColors[key as keyof SensorData] }]}> 
						<MaterialCommunityIcons name={sensorIcons[key as keyof SensorData]} size={32} color={sensorColors[key as keyof SensorData]} style={styles.sensorIcon} />
						<Text style={styles.sensorTitle}>{sensorLabels[key as keyof SensorData]}</Text>
						<Text style={styles.sensorValue}>
							{(value as number).toFixed(2)}{' '}
							{key === 'TEMPERATURE' && '°C'}
							{key === 'TurbidityValue' && ' NTU'}
							{key === 'DOValue' && ' mg/L'}
							{key === 'TDS' && ' ppm'}
							{(key === 'CH4' || key === 'H2S' || key === 'NH3' || key === 'NO2') && ' ppm'}
							{key === 'density' && ' ' + t('densityUnit')}
						</Text>
					</View>
				))}
			</View>
		</ScrollView>
	);
}

const createStyles = (colors: any) => StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 16,
		backgroundColor: colors.background,
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 10,
	},
	headerText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: colors.text,
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		fontSize: 12,
		color: colors.textSecondary,
		textAlign: 'center',
	},
	errorText: {
		fontSize: 12,
		color: colors.error,
		textAlign: 'center',
		marginTop: 4,
	},
	loadingText: {
		fontSize: 12,
		color: colors.primary,
		textAlign: 'center',
		marginTop: 4,
	},
	sensorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	sensorCard: {
		width: '48%',
		backgroundColor: colors.card,
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		borderWidth: 2,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		alignItems: 'center',
	},
	sensorIcon: {
		marginBottom: 8,
	},
	sensorTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.textSecondary,
		marginBottom: 8,
	},
	sensorValue: {
		fontSize: 20,
		fontWeight: 'bold',
	},
});
