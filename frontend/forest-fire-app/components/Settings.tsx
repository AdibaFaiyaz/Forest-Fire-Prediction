import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

interface SettingsProps {
  onBack?: () => void;
}

export default function SettingsScreen({ onBack }: SettingsProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);
  const toggleAutoRefresh = () => setAutoRefresh((prev) => !prev);
  const toggleLocationAccess = () => setLocationAccess((prev) => !prev);

  const handleAbout = () => {
    Alert.alert(
      "About Forest Fire Prediction",
      "Version 1.0.0\n\nAI-powered forest fire risk assessment system using machine learning algorithms.\n\nDeveloped for environmental safety and fire prevention.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure app preferences and data</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            <Feather name="settings" size={20} color={isDarkMode ? "#fff" : "#333"} /> App Preferences
          </Text>

          <View style={[styles.settingCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={20} color={isDarkMode ? "#fff" : "#2d5a27"} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.settingDescription, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                    Toggle dark theme interface
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#2d5a27" }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color={isDarkMode ? "#fff" : "#2d5a27"} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                    Risk Notifications
                  </Text>
                  <Text style={[styles.settingDescription, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                    Receive alerts for high fire risk conditions
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#2d5a27" }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="refresh" size={20} color={isDarkMode ? "#fff" : "#2d5a27"} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                    Auto Refresh
                  </Text>
                  <Text style={[styles.settingDescription, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                    Automatically update weather data
                  </Text>
                </View>
              </View>
              <Switch
                value={autoRefresh}
                onValueChange={toggleAutoRefresh}
                thumbColor={autoRefresh ? "#f4f3f4" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#2d5a27" }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="location" size={20} color={isDarkMode ? "#fff" : "#2d5a27"} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                    Location Access
                  </Text>
                  <Text style={[styles.settingDescription, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                    Allow location-based risk assessments
                  </Text>
                </View>
              </View>
              <Switch
                value={locationAccess}
                onValueChange={toggleLocationAccess}
                thumbColor={locationAccess ? "#f4f3f4" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#2d5a27" }}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            <Feather name="info" size={20} color={isDarkMode ? "#fff" : "#333"} /> Information
          </Text>

          <TouchableOpacity 
            style={[styles.actionCard, isDarkMode ? styles.darkCard : styles.lightCard]}
            onPress={handleAbout}
          >
            <Feather name="help-circle" size={20} color={isDarkMode ? "#fff" : "#2d5a27"} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                About App
              </Text>
              <Text style={[styles.actionDescription, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                Version, info and credits
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDarkMode ? "#666" : "#ccc"} />
          </TouchableOpacity>

          <View style={[styles.infoCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
            <Text style={[styles.infoTitle, isDarkMode ? styles.darkText : styles.lightText]}>
              🌲 Forest Fire Detection System
            </Text>
            <Text style={[styles.infoText, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
              AI-powered risk assessment using machine learning algorithms to predict forest fire conditions based on weather parameters.
            </Text>
            <View style={styles.versionInfo}>
              <Text style={[styles.versionText, isDarkMode ? styles.darkSubtext : styles.lightSubtext]}>
                Version 1.0.0 • Powered by ML
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingCard: {
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginLeft: 15,
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 15,
  },
  versionInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lightBackground: {
    backgroundColor: '#f5f5f5',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  lightCard: {
    backgroundColor: '#fff',
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  lightSubtext: {
    color: '#666',
  },
  darkSubtext: {
    color: '#aaa',
  },
});
