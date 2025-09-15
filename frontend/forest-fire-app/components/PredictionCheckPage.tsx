import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
interface PredictionData {
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
}

interface PredictionResult {
  fire_risk: boolean;
  risk_score: number;
  risk_level: string;
}

interface PredictionCheckPageProps {
  onBack: () => void;
  onPredictionResult: (result: PredictionResult, formData: PredictionData) => void;
  onNavigateToRiskMap: () => void;
}

export default function PredictionCheckPage({ onBack, onPredictionResult, onNavigateToRiskMap }: PredictionCheckPageProps) {
  const [formData, setFormData] = useState<PredictionData>({
    FFMC: '',
    DMC: '',
    DC: '',
    ISI: '',
    temp: '',
    RH: '',
    wind: '',
    rain: '',
    month: '',
    day: ''
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location access to store prediction location.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // Function to save data to Firebase
  const saveToFirebase = async (predictionResult: PredictionResult, inputData: PredictionData) => {
    setSaving(true);
    const location = await getCurrentLocation();

    const dataToSave = {
      ...inputData,
      predictedRisk: predictionResult.risk_level,
      riskScore: predictionResult.risk_score,
      fireRisk: predictionResult.fire_risk,
      location: location,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "fire_predictions"), dataToSave);
      Alert.alert("Success", "Prediction data saved to Firebase!");
    } catch (error) {
      Alert.alert("Error", "Failed to save data to Firebase.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PredictionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    // Validate inputs
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        Alert.alert('Error', `Please enter ${key}`);
        return;
      }
    }

    setLoading(true);
    setPrediction(null);

    // Try multiple API endpoints
    const apiEndpoints = [
      'http://localhost:5001/predict',
      'http://127.0.0.1:5001/predict',
      'http://192.168.1.10:5001/predict'
    ];

    let lastError = '';
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FFMC: parseFloat(formData.FFMC),
            DMC: parseFloat(formData.DMC),
            DC: parseFloat(formData.DC),
            ISI: parseFloat(formData.ISI),
            temp: parseFloat(formData.temp),
            RH: parseFloat(formData.RH),
            wind: parseFloat(formData.wind),
            rain: parseFloat(formData.rain),
            month: parseInt(formData.month),
            day: parseInt(formData.day)
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (response.ok) {
          setPrediction(result);
          onPredictionResult(result, formData);
          
          // Save to Firebase after successful prediction
          await saveToFirebase(result, formData);
          
          setLoading(false);
          return; // Success, exit the loop
        } else {
          lastError = result.error || 'Failed to get prediction';
          console.log(`Error from ${endpoint}:`, lastError);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          lastError = `Request timed out to ${endpoint}`;
        } else if (error.message.includes('Network request failed')) {
          lastError = `Network error - server might not be running at ${endpoint}`;
        } else {
          lastError = `Connection failed to ${endpoint}: ${error.message}`;
        }
        console.log(`Failed to connect to ${endpoint}:`, error);
      }
    }
    
    // If we get here, all endpoints failed
    setLoading(false);
    Alert.alert(
      'Connection Error', 
      `Unable to connect to the server.\n\nLast error: ${lastError}\n\nPlease:\n\n` +
      '1. Make sure the backend server is running\n' +
      '2. Open terminal and run: cd backend && python app.py\n' +
      '3. Check that the server shows "Running on http://localhost:5000"\n' +
      '4. Verify Flask and Flask-CORS are installed'
    );
  };

  const clearForm = () => {
    setFormData({
      FFMC: '',
      DMC: '',
      DC: '',
      ISI: '',
      temp: '',
      RH: '',
      wind: '',
      rain: '',
      month: '',
      day: ''
    });
    setPrediction(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fire Risk Prediction</Text>
        <Text style={styles.subtitle}>Enter Weather Data for Assessment</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Weather Parameters</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>FFMC (Fine Fuel Moisture Code)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter FFMC value (0-100)"
            placeholderTextColor="#666"
            value={formData.FFMC}
            onChangeText={(value) => handleInputChange('FFMC', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DMC (Duff Moisture Code)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter DMC value"
            placeholderTextColor="#666"
            value={formData.DMC}
            onChangeText={(value) => handleInputChange('DMC', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DC (Drought Code)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter DC value"
            placeholderTextColor="#666"
            value={formData.DC}
            onChangeText={(value) => handleInputChange('DC', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ISI (Initial Spread Index)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ISI value"
            placeholderTextColor="#666"
            value={formData.ISI}
            onChangeText={(value) => handleInputChange('ISI', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter temperature"
            placeholderTextColor="#666"
            value={formData.temp}
            onChangeText={(value) => handleInputChange('temp', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Relative Humidity (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter relative humidity"
            placeholderTextColor="#666"
            value={formData.RH}
            onChangeText={(value) => handleInputChange('RH', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wind Speed (km/h)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter wind speed"
            placeholderTextColor="#666"
            value={formData.wind}
            onChangeText={(value) => handleInputChange('wind', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rain (mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter rainfall amount"
            placeholderTextColor="#666"
            value={formData.rain}
            onChangeText={(value) => handleInputChange('rain', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Month (1-12)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter month number"
            placeholderTextColor="#666"
            value={formData.month}
            onChangeText={(value) => handleInputChange('month', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Day (1-7)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter day of week"
            placeholderTextColor="#666"
            value={formData.day}
            onChangeText={(value) => handleInputChange('day', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.predictButton]} 
            onPress={handlePredict}
            disabled={loading || saving}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : saving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Predict Fire Risk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearForm}
          >
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prediction Result */}
      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>📊 Prediction Result</Text>
          
          <View style={[styles.riskCard, { borderColor: getRiskColor(prediction.risk_level) }]}>
            <Text style={[styles.riskLevel, { color: getRiskColor(prediction.risk_level) }]}>
              {prediction.risk_level.toUpperCase()} RISK
            </Text>
            <Text style={styles.riskScore}>
              Risk Score: {(prediction.risk_score * 100).toFixed(1)}%
            </Text>
            <Text style={styles.riskStatus}>
              Fire Risk: {prediction.fire_risk ? 'YES' : 'NO'}
            </Text>
          </View>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>📋 Recommendations</Text>
            <Text style={styles.recommendationText}>
              {prediction.risk_level === 'High' && 
                "⚠️ HIGH RISK: Extreme fire conditions! Implement immediate fire prevention measures, evacuate if necessary, and monitor conditions closely."
              }
              {prediction.risk_level === 'Medium' && 
                "⚡ MEDIUM RISK: Moderate fire conditions. Take precautionary measures, avoid outdoor fires, and stay alert to changing conditions."
              }
              {prediction.risk_level === 'Low' && 
                "✅ LOW RISK: Favorable conditions. Normal fire safety precautions are sufficient, but remain vigilant."
              }
            </Text>
          </View>

          {/* Additional Safety Tips */}
          <View style={styles.safetyTipsCard}>
            <Text style={styles.safetyTipsTitle}>🛡️ Safety Tips</Text>
            <Text style={styles.safetyTipsText}>
              • Monitor weather conditions regularly{'\n'}
              • Keep emergency contacts handy{'\n'}
              • Have evacuation plans ready{'\n'}
              • Report any fires immediately{'\n'}
              • Follow local fire restrictions
            </Text>
          </View>

          {/* Navigation to Risk Map */}
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={onNavigateToRiskMap}
          >
            <Text style={styles.mapButtonText}>🗺️ View Risk Map</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: '#b8e6b8',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#b8e6b8',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  predictButton: {
    backgroundColor: '#2d5a27',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  riskCard: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 15,
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  riskScore: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  riskStatus: {
    fontSize: 16,
    color: '#666',
  },
  recommendationCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5a27',
    marginBottom: 15,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  safetyTipsCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  safetyTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  safetyTipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: '#2d5a27',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
