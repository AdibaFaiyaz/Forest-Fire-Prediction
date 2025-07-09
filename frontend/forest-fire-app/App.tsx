import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HomePage from './components/HomePage';
import PredictionCheckPage from './components/PredictionCheckPage';
import PredictionOutcome from './components/PredictionOutcome';

interface PredictionResult {
  fire_risk: boolean;
  risk_score: number;
  risk_level: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'prediction' | 'outcome'>('home');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const navigateToPrediction = () => {
    setCurrentPage('prediction');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToOutcome = (result: PredictionResult, data: any) => {
    setPredictionResult(result);
    setFormData(data);
    setCurrentPage('outcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {currentPage === 'home' && (
        <HomePage onNavigateToPrediction={navigateToPrediction} />
      )}
      
      {currentPage === 'prediction' && (
        <PredictionCheckPage 
          onBack={navigateToHome} 
          onPredictionResult={navigateToOutcome}
        />
      )}
      
      {currentPage === 'outcome' && (
        <PredictionOutcome 
          onBack={navigateToHome} 
          prediction={predictionResult}
          formData={formData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
