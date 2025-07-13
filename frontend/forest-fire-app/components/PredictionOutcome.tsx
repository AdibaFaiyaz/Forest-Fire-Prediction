import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

interface PredictionOutcomeProps {
  onBack: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRiskMap?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
  prediction: {
    fire_risk: boolean;
    risk_score: number;
    risk_level: string;
  } | null;
  formData?: {
    FFMC: string;
    DMC: string;
    DC: string;
    ISI: string;
    temp: string;
    RH: string;
    wind: string;
    rain: string;
    month: string;
    day: string;
  };
}

export default function PredictionOutcome({ onBack, onNavigateToHome, onNavigateToRiskMap, onNavigateToHistory, onNavigateToSettings, prediction, formData }: PredictionOutcomeProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getContributingFactors = () => {
    if (!formData) {
      return [
        { label: 'Temperature', value: '32°C', impact: 'high' },
        { label: 'Humidity', value: '25%', impact: 'high' },
        { label: 'Wind Speed', value: '15 km/h', impact: 'medium' },
        { label: 'Rainfall', value: '0.2 mm', impact: 'high' },
        { label: 'FFMC', value: '85.6', impact: 'high' },
        { label: 'DMC', value: '26.2', impact: 'medium' },
        { label: 'DC', value: '94.3', impact: 'high' },
        { label: 'ISI', value: '5.1', impact: 'medium' },
      ];
    }

    const getImpactLevel = (value: number, thresholds: { high: number; medium: number }) => {
      if (value >= thresholds.high) return 'high';
      if (value >= thresholds.medium) return 'medium';
      return 'low';
    };

    return [
      { 
        label: 'Temperature', 
        value: `${formData.temp}°C`, 
        impact: getImpactLevel(parseFloat(formData.temp), { high: 25, medium: 15 }) 
      },
      { 
        label: 'Humidity', 
        value: `${formData.RH}%`, 
        impact: getImpactLevel(100 - parseFloat(formData.RH), { high: 70, medium: 50 }) 
      },
      { 
        label: 'Wind Speed', 
        value: `${formData.wind} km/h`, 
        impact: getImpactLevel(parseFloat(formData.wind), { high: 20, medium: 10 }) 
      },
      { 
        label: 'Rainfall', 
        value: `${formData.rain} mm`, 
        impact: getImpactLevel(parseFloat(formData.rain) === 0 ? 100 : 100 - parseFloat(formData.rain), { high: 99, medium: 50 }) 
      },
      { 
        label: 'FFMC', 
        value: formData.FFMC, 
        impact: getImpactLevel(parseFloat(formData.FFMC), { high: 85, medium: 70 }) 
      },
      { 
        label: 'DMC', 
        value: formData.DMC, 
        impact: getImpactLevel(parseFloat(formData.DMC), { high: 30, medium: 15 }) 
      },
      { 
        label: 'DC', 
        value: formData.DC, 
        impact: getImpactLevel(parseFloat(formData.DC), { high: 600, medium: 300 }) 
      },
      { 
        label: 'ISI', 
        value: formData.ISI, 
        impact: getImpactLevel(parseFloat(formData.ISI), { high: 8, medium: 4 }) 
      },
    ];
  };

  const contributingFactors = getContributingFactors();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fire Risk Assessment</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Prediction Results</Text>
      </View>

      {/* Risk Level Section */}
      <View style={styles.riskSection}>
        <Text style={styles.riskTitle}>Risk Level</Text>
        
        {/* Forest Fire Image */}
        <View style={styles.imageContainer}>
          <View style={styles.forestImagePlaceholder}>
            <Text style={styles.forestImageText}>🌲🔥🌲</Text>
            <Text style={styles.forestImageSubtext}>Forest Fire Risk Visualization</Text>
          </View>
        </View>

        {/* Risk Level Display */}
        {prediction && (
          <View style={[styles.riskLevelCard, { borderColor: getRiskColor(prediction.risk_level) }]}>
            <Text style={[styles.riskLevelText, { color: getRiskColor(prediction.risk_level) }]}>
              {prediction.risk_level.toUpperCase()}
            </Text>
            <Text style={styles.riskScoreText}>
              {(prediction.risk_score * 100).toFixed(1)}% Risk
            </Text>
          </View>
        )}
      </View>

      {/* Contributing Factors */}
      <View style={styles.contributingSection}>
        <Text style={styles.sectionTitle}>Contributing Factors</Text>
        
        <View style={styles.factorsGrid}>
          {contributingFactors.map((factor, index) => (
            <View key={index} style={styles.factorCard}>
              <Text style={styles.factorLabel}>{factor.label}</Text>
              <Text style={styles.factorValue}>{factor.value}</Text>
              <View style={[styles.impactIndicator, { backgroundColor: getImpactColor(factor.impact) }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Historical Data */}
      <View style={styles.historicalSection}>
        <Text style={styles.sectionTitle}>Historical Data</Text>
        
        {/* Temperature Trend */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Temperature Trend</Text>
          <Text style={styles.chartValue}>{formData?.temp || '32'}°C</Text>
          <Text style={styles.chartSubtext}>Current Temperature</Text>
          
          {/* Simple chart visualization */}
          <View style={styles.chartArea}>
            <View style={styles.chartLine}>
              <View style={[styles.chartPoint, { left: '10%', bottom: '30%' }]} />
              <View style={[styles.chartPoint, { left: '25%', bottom: '45%' }]} />
              <View style={[styles.chartPoint, { left: '40%', bottom: '60%' }]} />
              <View style={[styles.chartPoint, { left: '55%', bottom: '40%' }]} />
              <View style={[styles.chartPoint, { left: '70%', bottom: '70%' }]} />
              <View style={[styles.chartPoint, { left: '85%', bottom: '55%' }]} />
            </View>
          </View>
          
          {/* Days of week */}
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>Mon</Text>
            <Text style={styles.chartLabel}>Tue</Text>
            <Text style={styles.chartLabel}>Wed</Text>
            <Text style={styles.chartLabel}>Thu</Text>
            <Text style={styles.chartLabel}>Fri</Text>
            <Text style={styles.chartLabel}>Sat</Text>
            <Text style={styles.chartLabel}>Sun</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToHome}>
          <Text style={styles.navIcon}><AntDesign name="home" size={24} color="black" /></Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navButton, styles.activeNavButton]} onPress={onNavigateToRiskMap}>
          <Text style={styles.navIcon}><Feather name="map-pin" size={24} color="black" /></Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToHistory}>
          <Text style={styles.navIcon}><MaterialCommunityIcons name="history" size={24} color="black" /></Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToSettings}>
          <Text style={styles.navIcon}><Feather name="settings" size={24} color="black" /></Text>
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d5a27',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#b8e6b8',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#b8e6b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  riskSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forestImagePlaceholder: {
    width: width - 80,
    height: 150,
    backgroundColor: '#2d4a2d',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forestImageText: {
    fontSize: 32,
    marginBottom: 10,
  },
  forestImageSubtext: {
    color: '#b8e6b8',
    fontSize: 14,
  },
  riskLevelCard: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  riskLevelText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  riskScoreText: {
    fontSize: 16,
    color: '#666',
  },
  contributingSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  factorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  factorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  impactIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historicalSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chartValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 5,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  chartArea: {
    width: width - 80,
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#2d5a27',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    paddingHorizontal: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
  },
  activeNavButton: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
  },
});
