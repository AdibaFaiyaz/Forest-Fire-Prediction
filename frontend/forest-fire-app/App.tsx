import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HomePage from './components/HomePage';
import PredictionCheckPage from './components/PredictionCheckPage';
import PredictionOutcome from './components/PredictionOutcome';
import PredictionHistory from './components/PredictionHistory';

interface PredictionResult {
  fire_risk: boolean;
  risk_score: number;
  risk_level: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'prediction' | 'outcome' | 'history'>('home');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const navigateToPrediction = () => {
    setCurrentPage('prediction');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToHistory = () => {
    setCurrentPage('history');
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
        <HomePage 
          onNavigateToPrediction={navigateToPrediction}
          onNavigateToHistory={navigateToHistory}
        />
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

      {currentPage === 'history' && (
        <PredictionHistory onBack={navigateToHome} />
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
