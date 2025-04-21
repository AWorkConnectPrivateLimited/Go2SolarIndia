import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

// Types
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Zone {
  id: string;
  name: string;
  center: Coordinates;
  radius: number;
  color: string;
  assignedAgents: string[];
}

interface Agent {
  id: string;
  name: string;
  email: string;
  status: string;
  zoneId: string | null;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

interface GeofencingContextType {
  zones: Zone[];
  agents: Agent[];
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  addZone: (zone: Omit<Zone, 'id' | 'assignedAgents'>) => void;
  removeZone: (zoneId: string) => void;
  assignAgentToZone: (agentId: string, zoneId: string) => void;
  removeAgentFromZone: (agentId: string, zoneId: string) => void;
  getZoneForLocation: (location: Coordinates) => Zone | null;
  getAgentZone: (agentId: string) => Zone | null;
  updateAgentLocation: (agentId: string, location: Coordinates) => void;
}

// Mock data for demonstration
const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Mumbai Central',
    center: { latitude: 19.0760, longitude: 72.8777 },
    radius: 5000,
    color: '#FF5252',
    assignedAgents: ['1', '2'],
  },
  {
    id: '2',
    name: 'Delhi North',
    center: { latitude: 28.7041, longitude: 77.1025 },
    radius: 8000,
    color: '#4CAF50',
    assignedAgents: ['3', '4'],
  },
  {
    id: '3',
    name: 'Bangalore Tech Park',
    center: { latitude: 12.9716, longitude: 77.5946 },
    radius: 3000,
    color: '#2196F3',
    assignedAgents: ['5'],
  },
];

const mockAgents: Agent[] = [
  { id: '1', name: 'Mike Johnson', email: 'mike@example.com', status: 'available', zoneId: '1' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', status: 'busy', zoneId: '1' },
  { id: '3', name: 'David Miller', email: 'david@example.com', status: 'available', zoneId: '2' },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', status: 'offline', zoneId: '2' },
  { id: '5', name: 'James Wilson', email: 'james@example.com', status: 'available', zoneId: '3' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@example.com', status: 'available', zoneId: null },
  { id: '7', name: 'Robert Taylor', email: 'robert@example.com', status: 'busy', zoneId: null },
];

// Create context
const GeofencingContext = createContext<GeofencingContextType | null>(null);

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Provider component
export const GeofencingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [agentLocations, setAgentLocations] = useState<Record<string, Coordinates>>({});

  // Request location permissions and get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        setError('Error getting location');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  const addZone = useCallback((zoneData: Omit<Zone, 'id' | 'assignedAgents'>) => {
    const newZone: Zone = {
      ...zoneData,
      id: Math.random().toString(36).substr(2, 9),
      assignedAgents: [],
    };
    setZones(prev => [...prev, newZone]);
  }, []);

  const removeZone = useCallback((zoneId: string) => {
    setZones(prev => prev.filter(zone => zone.id !== zoneId));
  }, []);

  const assignAgentToZone = useCallback((agentId: string, zoneId: string) => {
    setZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          assignedAgents: [...zone.assignedAgents, agentId],
        };
      }
      return zone;
    }));
  }, []);

  const removeAgentFromZone = useCallback((agentId: string, zoneId: string) => {
    setZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          assignedAgents: zone.assignedAgents.filter(id => id !== agentId),
        };
      }
      return zone;
    }));
  }, []);

  const getZoneForLocation = useCallback((location: Coordinates) => {
    return zones.find(zone => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        zone.center.latitude,
        zone.center.longitude
      );
      return distance <= zone.radius;
    }) || null;
  }, [zones]);

  const getAgentZone = useCallback((agentId: string) => {
    return zones.find(zone => zone.assignedAgents.includes(agentId)) || null;
  }, [zones]);

  const updateAgentLocation = useCallback((agentId: string, location: Coordinates) => {
    setAgentLocations(prev => ({
      ...prev,
      [agentId]: location,
    }));
  }, []);

  const value = {
    zones,
    agents,
    currentLocation,
    isLoading,
    error,
    addZone,
    removeZone,
    assignAgentToZone,
    removeAgentFromZone,
    getZoneForLocation,
    getAgentZone,
    updateAgentLocation,
  };

  return (
    <GeofencingContext.Provider value={value}>
      {children}
    </GeofencingContext.Provider>
  );
};

// Custom hook to use the geofencing context
export const useGeofencing = (): GeofencingContextType => {
  const context = useContext(GeofencingContext);
  if (!context) {
    throw new Error('useGeofencing must be used within a GeofencingProvider');
  }
  return context;
}; 