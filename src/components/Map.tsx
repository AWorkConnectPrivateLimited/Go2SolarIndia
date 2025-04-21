import React from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  style?: any;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, zoom = 15, style }) => {
  if (Platform.OS === 'web') {
    // For web, use Google Maps iframe
    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${latitude},${longitude}&zoom=${zoom}`;
    
    return (
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
      />
    );
  }

  // For native platforms, use react-native-maps
  const MapView = require('react-native-maps').default;
  return (
    <MapView
      style={[{ flex: 1 }, style]}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
  );
};

export default Map; 