import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { MaterialIcons } from '@expo/vector-icons';

import Feather from '@expo/vector-icons/Feather';

import Entypo from '@expo/vector-icons/Entypo';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

interface HomePageProps {
  onNavigateToPrediction: () => void;
  onNavigateToHistory: () => void;
  onNavigateToRiskMap: () => void;
}

export default function HomePage({ onNavigateToPrediction, onNavigateToHistory, onNavigateToRiskMap }: HomePageProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Forest Fire Detection</Text>
        <Text style={styles.heroSubtitle}>AI-Powered Risk Assessment System</Text>
        <Text style={styles.heroDescription}>
          Predict forest fire risks using advanced machine learning algorithms 
          and real-time weather data analysis
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}><MaterialIcons name="computer" size={24} color="black" /></Text>
          <Text style={styles.featureTitle}>AI-Powered Prediction</Text>
          <Text style={styles.featureDescription}>
            Advanced machine learning algorithms analyze weather patterns to predict fire risks
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}><Ionicons name="thermometer" size={32} color="black" /></Text>
          <Text style={styles.featureTitle}>Real-Time Weather Analysis</Text>
          <Text style={styles.featureDescription}>
            Monitor temperature, humidity, wind speed, and other critical weather factors
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}><Feather name="zap" size={24} color="black" /></Text>
          <Text style={styles.featureTitle}>Instant Risk Assessment</Text>
          <Text style={styles.featureDescription}>
            Get immediate fire risk levels with actionable recommendations
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}><Entypo name="bar-graph" size={24} color="black" /></Text>
          <Text style={styles.featureTitle}>Detailed Analytics</Text>
          <Text style={styles.featureDescription}>
            Comprehensive risk scores and safety recommendations based on data analysis
          </Text>
        </View>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter Weather Data</Text>
            <Text style={styles.stepDescription}>
              Input current weather parameters including temperature, humidity, wind, and fire weather indices
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>AI Analysis</Text>
            <Text style={styles.stepDescription}>
              Our machine learning model analyzes the data using trained algorithms
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Get Risk Assessment</Text>
            <Text style={styles.stepDescription}>
              Receive instant fire risk predictions with safety recommendations
            </Text>
          </View>
        </View>
      </View>

      {/* Safety Information */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}><FontAwesome5 name="shield-alt" size={24} color="black" /> Safety First</Text>
        <View style={styles.safetyCard}>
          <Text style={styles.safetyText}>
            • Always follow local fire restrictions and warnings{'\n'}
            • Report any fires immediately to authorities{'\n'}
            • Have evacuation plans ready during high-risk periods{'\n'}
            • Keep emergency supplies and contacts accessible{'\n'}
            • Stay informed about weather conditions
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={onNavigateToPrediction}
        >
          <Text style={styles.primaryButtonText}>Start Risk Assessment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={onNavigateToHistory}
        >
          <Text style={styles.secondaryButtonText}>View Prediction History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={onNavigateToRiskMap}
        >
          <Text style={styles.mapButtonText}>View Risk Map</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Forest Fire Detection System v1.0</Text>
        <Text style={styles.footerSubtext}>Powered by Machine Learning</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    backgroundColor: '#2d5a27',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#b8e6b8',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: '#b8e6b8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  howItWorksSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  safetySection: {
    padding: 20,
  },
  safetyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  safetyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  actionSection: {
    padding: 20,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2d5a27',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: width * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2d5a27',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: width * 0.8,
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#2d5a27',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapButton: {
    backgroundColor: '#2d5a27',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: width * 0.8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});
