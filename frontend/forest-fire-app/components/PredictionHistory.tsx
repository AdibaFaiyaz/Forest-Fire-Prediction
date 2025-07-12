import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';

interface HistoryEntry {
  id: string;
  FFMC: number;
  DMC: number;
  DC: number;
  ISI: number;
  temp: number;
  RH: number;
  wind: number;
  rain: number;
  month: number;
  day: number;
  predictedRisk: string;
  riskScore: number;
  fireRisk: boolean;
  timestamp: string;
  createdAt: any;
}

interface PredictionHistoryProps {
  onBack: () => void;
}

export default function PredictionHistory({ onBack }: PredictionHistoryProps) {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fetchHistoryData = async () => {
    try {
      const q = query(
        collection(db, 'fire_predictions'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const data: HistoryEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        } as HistoryEntry);
      });
      
      setHistoryData(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to load prediction history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const deleteEntry = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this prediction entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'fire_predictions', id));
              setHistoryData(prev => prev.filter(entry => entry.id !== id));
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistoryData();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1] || 'Unknown';
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={styles.loadingText}>Loading prediction history...</Text>
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
        <Text style={styles.title}>📋 Prediction History</Text>
        <Text style={styles.subtitle}>View all saved fire risk assessments</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {historyData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateTitle}>No Predictions Yet</Text>
            <Text style={styles.emptyStateText}>
              Start making fire risk predictions to see your history here.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.statsText}>
              Total Predictions: {historyData.length}
            </Text>
            
            {historyData.map((entry, index) => {
              const isExpanded = expandedCards.has(entry.id);
              
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={[
                    styles.historyCard,
                    isExpanded && styles.expandedCard
                  ]}
                  onPress={() => toggleCardExpansion(entry.id)}
                  activeOpacity={0.7}
                >
                  {/* Compact View */}
                  <View style={styles.compactView}>
                    <View style={styles.compactLeft}>
                      <Text style={styles.compactTitle}>#{historyData.length - index}</Text>
                      <Text style={styles.compactDate}>{formatDate(entry.timestamp)}</Text>
                    </View>
                    
                    <View style={styles.compactCenter}>
                      <View style={[styles.compactRiskBadge, { backgroundColor: getRiskColor(entry.predictedRisk) }]}>
                        <Text style={styles.compactRiskText}>
                          {entry.predictedRisk?.toUpperCase() || 'UNKNOWN'}
                        </Text>
                      </View>
                      <Text style={styles.compactTemp}>{entry.temp}°C</Text>
                    </View>
                    
                    <View style={styles.compactRight}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                      <Text style={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <View style={styles.expandedDetails}>
                      {/* Risk Assessment */}
                      <View style={[styles.riskBadge, { backgroundColor: getRiskColor(entry.predictedRisk) }]}>
                        <Text style={styles.riskText}>
                          {entry.predictedRisk?.toUpperCase() || 'UNKNOWN'} RISK
                        </Text>
                        <Text style={styles.riskScore}>
                          {(entry.riskScore * 100).toFixed(1)}%
                        </Text>
                      </View>

                      {/* Weather Data */}
                      <View style={styles.weatherSection}>
                        <Text style={styles.sectionTitle}>Weather Conditions</Text>
                        <View style={styles.weatherGrid}>
                          <View style={styles.weatherItem}>
                            <Text style={styles.weatherLabel}>Temperature</Text>
                            <Text style={styles.weatherValue}>{entry.temp}°C</Text>
                          </View>
                          <View style={styles.weatherItem}>
                            <Text style={styles.weatherLabel}>Humidity</Text>
                            <Text style={styles.weatherValue}>{entry.RH}%</Text>
                          </View>
                          <View style={styles.weatherItem}>
                            <Text style={styles.weatherLabel}>Wind Speed</Text>
                            <Text style={styles.weatherValue}>{entry.wind} km/h</Text>
                          </View>
                          <View style={styles.weatherItem}>
                            <Text style={styles.weatherLabel}>Rainfall</Text>
                            <Text style={styles.weatherValue}>{entry.rain} mm</Text>
                          </View>
                        </View>
                      </View>

                      {/* Fire Indices */}
                      <View style={styles.indicesSection}>
                        <Text style={styles.sectionTitle}>Fire Weather Indices</Text>
                        <View style={styles.indicesGrid}>
                          <View style={styles.indexItem}>
                            <Text style={styles.indexLabel}>FFMC</Text>
                            <Text style={styles.indexValue}>{entry.FFMC}</Text>
                          </View>
                          <View style={styles.indexItem}>
                            <Text style={styles.indexLabel}>DMC</Text>
                            <Text style={styles.indexValue}>{entry.DMC}</Text>
                          </View>
                          <View style={styles.indexItem}>
                            <Text style={styles.indexLabel}>DC</Text>
                            <Text style={styles.indexValue}>{entry.DC}</Text>
                          </View>
                          <View style={styles.indexItem}>
                            <Text style={styles.indexLabel}>ISI</Text>
                            <Text style={styles.indexValue}>{entry.ISI}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Additional Info */}
                      <View style={styles.additionalInfo}>
                        <Text style={styles.infoText}>
                          📅 {getMonthName(entry.month)} • {getDayName(entry.day)}
                        </Text>
                        <Text style={styles.infoText}>
                          🔥 Fire Risk: {entry.fireRisk ? 'YES' : 'NO'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedCard: {
    padding: 20,
    marginBottom: 20,
  },
  compactView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeft: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  compactDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  compactCenter: {
    flex: 1,
    alignItems: 'center',
  },
  compactRiskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  compactRiskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactTemp: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  compactRight: {
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginBottom: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  expandedDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  riskBadge: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  riskText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  riskScore: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  weatherSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  indicesSection: {
    marginBottom: 15,
  },
  indicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indexItem: {
    width: '48%',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  indexLabel: {
    fontSize: 12,
    color: '#2d5a27',
    fontWeight: '500',
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});
