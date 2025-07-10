import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface RiskMapProps {
  onBack: () => void;
}

export default function RiskMap({ onBack }: RiskMapProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  useEffect(() => {
    const fetchPredictions = async () => {
      const snapshot = await getDocs(collection(db, 'fire_predictions'));
      const results = snapshot.docs
        .map(doc => doc.data())
        .filter(item => item.location?.latitude && item.location?.longitude);
      setData(results);
      setLoading(false);
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Fire Risk Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Fire Risk Map</Text>
        <Text style={styles.subtitle}>View All Risk Predictions</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: data[0]?.location.latitude || 20.5937,
          longitude: data[0]?.location.longitude || 78.9629,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {data.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.location.latitude,
              longitude: item.location.longitude,
            }}
            title={`${item.predictedRisk.toUpperCase()} Risk`}
            description={`Score: ${(item.riskScore * 100).toFixed(1)}%`}
            pinColor={getColor(item.predictedRisk)}
          />
        ))}
      </MapView>
    </View>
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
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
