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
}

export default function PredictionCheckPage({ onBack }: PredictionCheckPageProps) {
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

    try {
      const response = await fetch('http://localhost:5000/predict', {
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
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setPrediction(result);
      } else {
        Alert.alert('Error', result.error || 'Failed to get prediction');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔍 Fire Risk Prediction</Text>
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
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔍 Predict Fire Risk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearForm}
          >
            <Text style={styles.clearButtonText}>🗑️ Clear Form</Text>
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
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
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
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  riskCard: {
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    marginBottom: 5,
  },
  riskStatus: {
    fontSize: 16,
    color: '#ccc',
  },
  recommendationCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5a27',
    marginBottom: 15,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  safetyTipsCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  safetyTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  safetyTipsText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});
