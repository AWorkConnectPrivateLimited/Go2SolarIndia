import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { useGeofencing } from '../contexts/GeofencingContext';

interface AgentLocationMapProps {
  agentId: string;
  showControls?: boolean;
  style?: any;
}

export const AgentLocationMap: React.FC<AgentLocationMapProps> = ({
  agentId,
  showControls = true,
  style,
}) => {
  const { getAgentZone, updateAgentLocation } = useGeofencing();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  const zone = getAgentZone(agentId);
  const initialRegion = {
    latitude: zone?.center.latitude || 20.5937, // Center of India
    longitude: zone?.center.longitude || 78.9629,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      updateAgentLocation(agentId, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, [agentId]);

  const startTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setLocation(location);
          updateAgentLocation(agentId, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      setErrorMsg('Error tracking location');
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Agent Location"
          />
        )}
        {zone && (
          <Circle
            center={zone.center}
            radius={zone.radius}
            fillColor={`${zone.color}33`}
            strokeColor={zone.color}
            strokeWidth={2}
          />
        )}
      </MapView>
      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
      {showControls && (
        <View style={styles.controls}>
          {!isTracking ? (
            <Button mode="contained" onPress={startTracking}>
              Start Tracking
            </Button>
          ) : (
            <Button mode="contained" onPress={stopTracking}>
              Stop Tracking
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  errorContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
}); 