import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useGeofencing } from '../contexts/GeofencingContext';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export const useAgentLocation = (agentId: string) => {
  const { updateAgentLocation, getZoneForLocation, isLocationInZone } = useGeofencing();
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Start tracking location
  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      setIsTracking(true);

      // Start watching position
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const update: LocationUpdate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            heading: location.coords.heading,
          };

          setLocation(update);
          updateAgentLocation(agentId, {
            latitude: update.latitude,
            longitude: update.longitude,
          });

          // Check if agent is in their assigned zone
          const currentZone = getZoneForLocation(update.latitude, update.longitude);
          if (currentZone) {
            console.log(`Agent ${agentId} is in zone: ${currentZone.name}`);
          }
        }
      );
    } catch (err) {
      setError('Error tracking location');
      console.error(err);
      setIsTracking(false);
    }
  };

  // Stop tracking location
  const stopTracking = () => {
    setIsTracking(false);
    // Note: In a real implementation, you would need to store and clear the location subscription
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
}; 