import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Animated } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Location {
  latitude: number;
  longitude: number;
}

interface FirePrediction {
  location: Location;
  predictedRisk: string;
  riskScore: number;
}

interface RiskMapProps {
  onBack: () => void;
}

interface MovablePin {
  latitude: number;
  longitude: number;
  isForest: boolean;
  isDesert?: boolean;
  isMountain?: boolean;
  isPlain?: boolean;
  riskLevel?: string;
  placeName?: string;
}

interface LocationDetails {
  name: string;
  address: string;
  coordinates: string;
  isForest: boolean;
  isDesert?: boolean;
  isMountain?: boolean;
  isPlain?: boolean;
  riskLevel?: string;
}

export default function RiskMap({ onBack }: RiskMapProps) {
  const [data, setData] = useState<FirePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [movablePin, setMovablePin] = useState<MovablePin | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen

  const getColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Get exact location name with only 3 parts: Area, State, Country
  const getPlaceName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Use a free reverse geocoding API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Construct location name with only 3 parts
        const parts = [];
        
        // Add locality/area (first priority)
        if (data.locality) {
          parts.push(data.locality);
        } else if (data.city) {
          parts.push(data.city);
        }
        
        // Add state (second priority)
        if (data.principalSubdivision) {
          parts.push(data.principalSubdivision);
        }
        
        // Add country (third priority)
        if (data.countryName) {
          parts.push(data.countryName);
        }
        
        // Return only first 3 parts
        if (parts.length > 0) {
          return parts.slice(0, 3).join(', ');
        }
        
        // Fallback to administrative divisions
        if (data.localityInfo?.administrative) {
          const admin = data.localityInfo.administrative;
          const adminParts = [];
          
          if (admin[0]?.name) adminParts.push(admin[0].name); // Area/District
          if (admin[1]?.name) adminParts.push(admin[1].name); // State
          if (admin[2]?.name) adminParts.push(admin[2].name); // Country
          
          if (adminParts.length > 0) {
            return adminParts.slice(0, 3).join(', ');
          }
        }
        
        return data.locality || data.city || "Unknown Location";
      }
      
      // Fallback to OpenStreetMap Nominatim API
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        
        if (nominatimData.address) {
          const address = nominatimData.address;
          const locationParts = [];
          
          // Build location with priority: village/town/city, state, country
          if (address.village) {
            locationParts.push(address.village);
          } else if (address.town) {
            locationParts.push(address.town);
          } else if (address.city) {
            locationParts.push(address.city);
          }
          
          if (address.state) {
            locationParts.push(address.state);
          }
          
          if (address.country) {
            locationParts.push(address.country);
          }
          
          // Return only first 3 parts
          if (locationParts.length > 0) {
            return locationParts.slice(0, 3).join(', ');
          }
        }
        
        return nominatimData.display_name || "Unknown Location";
      }
      
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
    
    // Ultimate fallback - use coordinate-based approximation
    return getApproximateLocation(latitude, longitude);
  };

  // Fallback function for approximate location - also 3 parts only
  const getApproximateLocation = (latitude: number, longitude: number): string => {
    const indianStates = [
      { lat: 28.6139, lng: 77.2090, name: "Delhi", state: "Delhi", country: "India" },
      { lat: 19.0760, lng: 72.8777, name: "Mumbai", state: "Maharashtra", country: "India" },
      { lat: 12.9716, lng: 77.5946, name: "Bangalore", state: "Karnataka", country: "India" },
      { lat: 13.0827, lng: 80.2707, name: "Chennai", state: "Tamil Nadu", country: "India" },
      { lat: 22.5726, lng: 88.3639, name: "Kolkata", state: "West Bengal", country: "India" },
      { lat: 17.3850, lng: 78.4867, name: "Hyderabad", state: "Telangana", country: "India" },
      { lat: 23.0225, lng: 72.5714, name: "Ahmedabad", state: "Gujarat", country: "India" },
      { lat: 18.5204, lng: 73.8567, name: "Pune", state: "Maharashtra", country: "India" },
      { lat: 26.9124, lng: 75.7873, name: "Jaipur", state: "Rajasthan", country: "India" },
      { lat: 30.7333, lng: 76.7794, name: "Chandigarh", state: "Punjab", country: "India" },
      { lat: 15.2993, lng: 74.1240, name: "Goa", state: "Goa", country: "India" },
      { lat: 11.0168, lng: 76.9558, name: "Coimbatore", state: "Tamil Nadu", country: "India" },
      { lat: 21.1458, lng: 79.0882, name: "Nagpur", state: "Maharashtra", country: "India" },
      { lat: 25.5941, lng: 85.1376, name: "Patna", state: "Bihar", country: "India" },
      { lat: 26.8467, lng: 80.9462, name: "Lucknow", state: "Uttar Pradesh", country: "India" },
    ];

    // Find closest major location
    let closestLocation = "Unknown Location";
    let minDistance = Infinity;
    let closestCity = null;

    for (const location of indianStates) {
      const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = location;
      }
    }

    if (closestCity) {
      if (minDistance < 50) { // Within 50km - use city name
        return `${closestCity.name}, ${closestCity.state}, ${closestCity.country}`;
      } else if (minDistance < 200) { // Within 200km - show distance
        return `Near ${closestCity.name}, ${closestCity.state}, ${closestCity.country}`;
      } else {
        return `Remote area, ${closestCity.state}, ${closestCity.country}`;
      }
    }

    return closestLocation;
  };

  // Forest area detection - only high-density tree and bush areas
  const analyzeLocation = async (latitude: number, longitude: number): Promise<{ isForest: boolean; isDesert?: boolean; isMountain?: boolean; isPlain?: boolean; riskLevel?: string; placeName: string }> => {
    setAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [isUrbanArea, isDesertArea, isMountainArea, isHighDensityForest, placeName] = await Promise.all([
        checkUrbanArea(latitude, longitude),
        checkDesertArea(latitude, longitude),
        checkMountainArea(latitude, longitude),
        checkHighDensityForest(latitude, longitude),
        getPlaceName(latitude, longitude)
      ]);
      
      if (isUrbanArea) {
        return { isForest: false, isDesert: false, isMountain: false, isPlain: false, placeName };
      }
      
      if (isDesertArea) {
        return { isForest: false, isDesert: true, isMountain: false, isPlain: false, placeName };
      }
      
      if (isMountainArea) {
        return { isForest: false, isDesert: false, isMountain: true, isPlain: false, placeName };
      }
      
      if (isHighDensityForest) {
        const riskLevel = calculateFireRisk(latitude, longitude);
        return { isForest: true, isDesert: false, isMountain: false, isPlain: false, riskLevel, placeName };
      }
      
      // If none of the above, it's considered plain area (grassland, sparse vegetation, etc.)
      return { isForest: false, isDesert: false, isMountain: false, isPlain: true, placeName };
    } finally {
      setAnalyzing(false);
    }
  };

  // Check for high-density forest areas only
  const checkHighDensityForest = async (latitude: number, longitude: number): Promise<boolean> => {
    const denseForestAreas = [
      // Amazon Rainforest (South America)
      { lat: -3.0, lng: -60.0, radius: 1500, name: "Amazon Rainforest", density: "very high" },
      // Congo Basin (Central Africa)
      { lat: 0.0, lng: 25.0, radius: 800, name: "Congo Basin", density: "very high" },
      // Western Ghats Dense Forests (India)
      { lat: 15.0, lng: 74.0, radius: 100, name: "Western Ghats Dense Forest", density: "very high" },
      // Northeastern India Dense Forests
      { lat: 25.0, lng: 91.0, radius: 200, name: "Northeast India Dense Forest", density: "very high" },
      // Sundarban Mangrove Forest (India/Bangladesh)
      { lat: 21.9, lng: 89.2, radius: 50, name: "Sundarban Forest", density: "very high" },
      // Boreal Forests (Canada/Russia)
      { lat: 60.0, lng: -100.0, radius: 1000, name: "Canadian Boreal Forest", density: "high" },
      { lat: 60.0, lng: 100.0, radius: 1000, name: "Siberian Boreal Forest", density: "high" },
      // Pacific Northwest (USA)
      { lat: 47.0, lng: -122.0, radius: 150, name: "Pacific Northwest Forest", density: "very high" },
      // Appalachian Dense Forests (USA)
      { lat: 37.0, lng: -82.0, radius: 100, name: "Appalachian Dense Forest", density: "high" },
      // Valdivian Temperate Rainforest (Chile)
      { lat: -40.0, lng: -73.0, radius: 100, name: "Valdivian Rainforest", density: "very high" },
      // Taiga Forests (Northern regions)
      { lat: 65.0, lng: 30.0, radius: 500, name: "Scandinavian Taiga", density: "high" },
      // Central Indian Dense Forests
      { lat: 22.0, lng: 82.0, radius: 150, name: "Central India Dense Forest", density: "high" },
      // Himalayan Dense Forests
      { lat: 28.0, lng: 84.0, radius: 200, name: "Himalayan Dense Forest", density: "high" },
    ];
    
    for (const forest of denseForestAreas) {
      const distance = calculateDistance(latitude, longitude, forest.lat, forest.lng);
      if (distance < forest.radius) {
        // Additional check for vegetation density (simulated)
        const vegetationDensity = calculateVegetationDensity(latitude, longitude);
        if (vegetationDensity >= 0.7) { // 70% or higher vegetation density
          return true;
        }
      }
    }
    
    return false;
  };

  // Simulate vegetation density calculation
  const calculateVegetationDensity = (latitude: number, longitude: number): number => {
    // In a real app, this would use NDVI (Normalized Difference Vegetation Index) data
    // from satellite imagery APIs like Google Earth Engine, NASA, or Sentinel
    
    // For simulation, we'll use a basic algorithm considering:
    // - Distance from equator (tropical regions have higher density)
    // - Rainfall patterns (simulated)
    // - Elevation effects
    
    const latFactor = Math.cos(Math.abs(latitude) * Math.PI / 180); // Higher near equator
    const randomFactor = Math.random() * 0.3; // Simulate local variations
    const baseDensity = 0.5;
    
    return Math.min(1.0, baseDensity + latFactor * 0.3 + randomFactor);
  };

  // Enhanced fire risk calculation for dense forests
  const calculateFireRisk = (latitude: number, longitude: number): string => {
    const vegetationDensity = calculateVegetationDensity(latitude, longitude);
    const seasonalFactor = Math.random(); // Simulate seasonal dry/wet conditions
    
    // Higher density forests have different risk patterns
    if (vegetationDensity > 0.8) {
      // Very dense forests - moderate risk due to humidity but high fuel load
      if (seasonalFactor > 0.6) return 'high';
      if (seasonalFactor > 0.3) return 'medium';
      return 'low';
    } else if (vegetationDensity > 0.6) {
      // Dense forests - higher risk due to dry undergrowth
      if (seasonalFactor > 0.5) return 'high';
      if (seasonalFactor > 0.2) return 'medium';
      return 'low';
    } else {
      // Moderate density
      if (seasonalFactor > 0.7) return 'high';
      if (seasonalFactor > 0.4) return 'medium';
      return 'low';
    }
  };

  const showLocationDetails = (details: LocationDetails) => {
    setLocationDetails(details);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideLocationDetails = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setLocationDetails(null);
    });
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    setMovablePin({
      latitude,
      longitude,
      isForest: true,
      isDesert: false,
      isMountain: false,
      isPlain: false,
    });
    
    try {
      const analysis = await analyzeLocation(latitude, longitude);
      
      setMovablePin({
        latitude,
        longitude,
        isForest: analysis.isForest,
        isDesert: analysis.isDesert,
        isMountain: analysis.isMountain,
        isPlain: analysis.isPlain,
        riskLevel: analysis.riskLevel,
        placeName: analysis.placeName,
      });

      // Show location details popup
      showLocationDetails({
        name: analysis.placeName,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        isForest: analysis.isForest,
        isDesert: analysis.isDesert,
        isMountain: analysis.isMountain,
        isPlain: analysis.isPlain,
        riskLevel: analysis.riskLevel,
      });
      
      if (analysis.isDesert) {
        Alert.alert(
          "Desert Area Detected 🏜️",
          "This area appears to be a desert region. Desert areas have unique fire characteristics with sparse vegetation and extreme temperatures.",
          [{ text: "OK" }]
        );
      } else if (analysis.isMountain) {
        Alert.alert(
          "Mountain Area Detected 🏔️",
          "This area appears to be a mountainous region. Mountain areas have unique terrain with varied vegetation and weather patterns.",
          [{ text: "OK" }]
        );
      } else if (analysis.isForest) {
        Alert.alert(
          "Dense Forest Area Detected 🌲",
          `Fire Risk Level: ${analysis.riskLevel?.toUpperCase() || 'Unknown'}\n\nThis area has high-density trees and bushes. Dense vegetation creates significant fire risk with heavy fuel loads. Monitor weather conditions, humidity levels, and vegetation dryness carefully.`,
          [{ text: "OK" }]
        );
      } else if (analysis.isPlain) {
        Alert.alert(
          "Plain Area Detected 🌾",
          "This area appears to be a plain region with grasslands, agricultural land, or sparse vegetation. Plain areas typically have lower fire risk compared to dense forests.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Urban Area Detected 🏙️",
          "This appears to be an urban/developed area with buildings and infrastructure. Forest fire risk assessment is not applicable here.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not analyze this location. Please try again.");
      setMovablePin(null);
    }
  };

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'fire_predictions'));
        const results = snapshot.docs
          .map(doc => doc.data() as FirePrediction)
          .filter(item => item.location?.latitude && item.location?.longitude);
        setData(results);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkUrbanArea = async (latitude: number, longitude: number): Promise<boolean> => {
    const urbanCenters = [
      { lat: 28.6139, lng: 77.2090, name: "Delhi" },
      { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
      { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
      { lat: 13.0827, lng: 80.2707, name: "Chennai" },
      { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
      { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
      { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
      { lat: 18.5204, lng: 73.8567, name: "Pune" },
    ];
    
    for (const city of urbanCenters) {
      const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
      if (distance < 50) { // 50km radius
        return true;
      }
    }
    
    return false;
  };

  const checkDesertArea = async (latitude: number, longitude: number): Promise<boolean> => {
    const desertRegions = [
      // Thar Desert (Rajasthan, India)
      { lat: 27.0, lng: 71.0, radius: 200, name: "Thar Desert" },
      // Sahara Desert (North Africa)
      { lat: 23.0, lng: 8.0, radius: 1000, name: "Sahara Desert" },
      // Arabian Desert
      { lat: 25.0, lng: 45.0, radius: 800, name: "Arabian Desert" },
      // Gobi Desert
      { lat: 42.0, lng: 103.0, radius: 500, name: "Gobi Desert" },
      // Kalahari Desert
      { lat: -24.0, lng: 21.0, radius: 400, name: "Kalahari Desert" },
      // Atacama Desert
      { lat: -24.0, lng: -69.0, radius: 300, name: "Atacama Desert" },
      // Sonoran Desert
      { lat: 33.0, lng: -112.0, radius: 200, name: "Sonoran Desert" },
      // Mojave Desert
      { lat: 35.0, lng: -115.0, radius: 150, name: "Mojave Desert" },
    ];
    
    for (const desert of desertRegions) {
      const distance = calculateDistance(latitude, longitude, desert.lat, desert.lng);
      if (distance < desert.radius) {
        return true;
      }
    }
    
    return false;
  };

  const checkMountainArea = async (latitude: number, longitude: number): Promise<boolean> => {
    const mountainRanges = [
      // Himalayas (India, Nepal, Bhutan)
      { lat: 28.0, lng: 84.0, radius: 800, name: "Himalayas" },
      // Western Ghats (India)
      { lat: 15.0, lng: 74.0, radius: 300, name: "Western Ghats" },
      // Eastern Ghats (India)
      { lat: 14.0, lng: 79.0, radius: 200, name: "Eastern Ghats" },
      // Aravalli Range (India)
      { lat: 25.0, lng: 73.0, radius: 150, name: "Aravalli Range" },
      // Rocky Mountains (North America)
      { lat: 45.0, lng: -110.0, radius: 800, name: "Rocky Mountains" },
      // Andes Mountains (South America)
      { lat: -15.0, lng: -70.0, radius: 1000, name: "Andes Mountains" },
      // Alps (Europe)
      { lat: 46.0, lng: 8.0, radius: 300, name: "Alps" },
      // Ural Mountains (Russia)
      { lat: 60.0, lng: 60.0, radius: 400, name: "Ural Mountains" },
      // Appalachian Mountains (North America)
      { lat: 37.0, lng: -82.0, radius: 300, name: "Appalachian Mountains" },
      // Atlas Mountains (North Africa)
      { lat: 31.0, lng: -7.0, radius: 200, name: "Atlas Mountains" },
    ];
    
    for (const mountain of mountainRanges) {
      const distance = calculateDistance(latitude, longitude, mountain.lat, mountain.lng);
      if (distance < mountain.radius) {
        return true;
      }
    }
    
    return false;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={styles.loadingText}>Loading Fire Risk Map...</Text>
      </View>
    );
  }

  if (data.length === 0 && !movablePin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🗺️ Fire Risk Map</Text>
          <Text style={styles.subtitle}>Tap anywhere on the map to analyze</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.noDataText}>Tap on the map to analyze any location</Text>
          <Text style={styles.noDataSubtext}>Find out if an area is forest or urban and get fire risk assessment</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Fire Risk Map</Text>
        <Text style={styles.subtitle}>
          {analyzing ? "Analyzing location..." : "Tap anywhere to analyze"}
        </Text>
      </View>

      {analyzing && (
        <View style={styles.analysisBar}>
          <ActivityIndicator size="small" color="#2d5a27" />
          <Text style={styles.analysisText}>Analyzing location...</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: data.length > 0 ? data[0].location.latitude : 20.5937,
          longitude: data.length > 0 ? data[0].location.longitude : 78.9629,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onPress={handleMapPress}
      >
        {data.map((item, index) => (
          <Marker
            key={`prediction-${index}`}
            coordinate={{
              latitude: item.location.latitude,
              longitude: item.location.longitude,
            }}
            title={`${item.predictedRisk.toUpperCase()} Risk`}
            description={`Score: ${(item.riskScore * 100).toFixed(1)}%`}
            pinColor={getColor(item.predictedRisk)}
          />
        ))}

        {movablePin && (
          <Marker
            coordinate={{
              latitude: movablePin.latitude,
              longitude: movablePin.longitude,
            }}
            title={
              movablePin.isDesert ? "Desert Area 🏜️" : 
              movablePin.isMountain ? "Mountain Area 🏔️" :
              movablePin.isForest ? "Dense Forest Area 🌲" :
              movablePin.isPlain ? "Plain Area 🌾" : "Urban Area 🏙️"
            }
            description={
              movablePin.isDesert ? "Desert Region" :
              movablePin.isMountain ? "Mountain Region" :
              movablePin.isForest 
                ? `Dense Forest - Fire Risk: ${movablePin.riskLevel?.toUpperCase() || 'Analyzing...'}`
                : movablePin.isPlain 
                  ? "Plain Region with Grasslands"
                  : "Urban/Developed Area"
            }
            pinColor={
              movablePin.isDesert ? 'yellow' :
              movablePin.isMountain ? 'purple' :
              movablePin.isForest 
                ? (movablePin.riskLevel ? getColor(movablePin.riskLevel) : 'blue')
                : movablePin.isPlain 
                  ? 'orange' 
                  : 'green'
            }
            draggable={true}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              handleMapPress({ nativeEvent: { coordinate: { latitude, longitude } } } as MapPressEvent);
            }}
          />
        )}
      </MapView>

      {/* Location Details Popup */}
      {locationDetails && (
        <Animated.View 
          style={[
            styles.locationDetailsPopup, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.popupHeader}>
            <Text style={styles.popupTitle}>📍 Location Details</Text>
            <TouchableOpacity onPress={hideLocationDetails}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.popupContent}>
            <View style={styles.locationInfo}>
              <Text style={styles.placeName}>{locationDetails.name}</Text>
              <Text style={styles.coordinates}>{locationDetails.coordinates}</Text>
            </View>
            
            <View style={styles.analysisResult}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: 
                  locationDetails.isDesert ? '#fff3e0' :
                  locationDetails.isMountain ? '#f3e5f5' :
                  locationDetails.isForest ? '#e8f5e8' :
                  locationDetails.isPlain ? '#fff8e1' : '#e3f2fd' 
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: 
                    locationDetails.isDesert ? '#f57c00' :
                    locationDetails.isMountain ? '#7b1fa2' :
                    locationDetails.isForest ? '#2d5a27' :
                    locationDetails.isPlain ? '#f57c00' : '#1976d2' 
                  }
                ]}>
                  {locationDetails.isDesert ? '🏜️ Desert Area' :
                   locationDetails.isMountain ? '🏔️ Mountain Area' :
                   locationDetails.isForest ? '🌲 Dense Forest Area' :
                   locationDetails.isPlain ? '🌾 Plain Area' : '🏙️ Urban Area'}
                </Text>
              </View>
              
              {locationDetails.isForest && locationDetails.riskLevel && (
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getColor(locationDetails.riskLevel) }
                ]}>
                  <Text style={styles.riskText}>
                    {locationDetails.riskLevel.toUpperCase()} RISK
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}
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
  analysisBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  analysisText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2d5a27',
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  locationDetailsPopup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  popupContent: {
    padding: 20,
  },
  locationInfo: {
    marginBottom: 15,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
  },
  analysisResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});