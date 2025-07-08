import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HomePage from './components/HomePage';
import PredictionCheckPage from './components/PredictionCheckPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'prediction'>('home');

  const navigateToPrediction = () => {
    setCurrentPage('prediction');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {currentPage === 'home' ? (
        <HomePage onNavigateToPrediction={navigateToPrediction} />
      ) : (
        <PredictionCheckPage onBack={navigateToHome} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
