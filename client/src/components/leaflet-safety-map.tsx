import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useGeolocation } from '@/hooks/use-geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color: string, type: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const safeZoneIcon = createCustomIcon('#10b981', 'safe');
const threatIcon = createCustomIcon('#ef4444', 'threat');
const userIcon = createCustomIcon('#3b82f6', 'user');
const militaryIcon = createCustomIcon('#8b5cf6', 'military');

interface MapCenterController {
  center: [number, number];
  zoom: number;
}

function MapCenterController({ center, zoom }: MapCenterController) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function LeafletSafetyMap() {
  const location = useGeolocation({ watch: true });
  
  // Fetch safe zones
  const { data: safeZones = [] } = useQuery({
    queryKey: ['/api/safe-zones'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch threats
  const { data: threats = [] } = useQuery({
    queryKey: ['/api/threats'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch active alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['/api/alerts'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Default center (Kashmir region)
  const defaultCenter: [number, number] = [34.0837, 74.7973];
  
  // Use user location if available, otherwise default
  const mapCenter: [number, number] = location.latitude && location.longitude 
    ? [location.latitude, location.longitude] 
    : defaultCenter;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return '#dc2626';
      case 'alert': return '#ea580c';
      case 'warning': return '#d97706';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Interactive Safety Map</span>
          <Badge variant="secondary" className="ml-auto">
            Live Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={location.latitude ? 12 : 8}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapCenterController center={mapCenter} zoom={location.latitude ? 12 : 8} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location */}
            {location.latitude && location.longitude && (
              <Marker 
                position={[location.latitude, location.longitude]} 
                icon={userIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-blue-600">Your Location</h3>
                    <p className="text-sm text-gray-600">
                      Current Position<br/>
                      Accuracy: ±{location.accuracy ? Math.round(location.accuracy) : 'Unknown'}m
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Safe Zones */}
            {safeZones.map((zone: any) => {
              if (!zone.location?.lat || !zone.location?.lng) return null;
              
              return (
                <Marker
                  key={`safe-${zone.id}`}
                  position={[zone.location.lat, zone.location.lng]}
                  icon={safeZoneIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-green-600">{zone.name}</h3>
                      <p className="text-sm capitalize">{zone.type.replace('_', ' ')}</p>
                      {zone.capacity && (
                        <p className="text-sm">Capacity: {zone.capacity} people</p>
                      )}
                      {zone.contact && (
                        <p className="text-sm">Contact: {zone.contact}</p>
                      )}
                      {zone.facilities && zone.facilities.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-medium">Facilities:</p>
                          <p className="text-xs">{zone.facilities.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Threat Locations */}
            {threats.map((threat: any) => {
              if (!threat.location?.lat || !threat.location?.lng) return null;
              
              return (
                <Marker
                  key={`threat-${threat.id}`}
                  position={[threat.location.lat, threat.location.lng]}
                  icon={threatIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-red-600">{threat.title}</h3>
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: getSeverityColor(threat.severity) }}
                        className="text-white mb-2"
                      >
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <p className="text-sm">{threat.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {threat.source} | Type: {threat.type}
                      </p>
                      {threat.confidence && (
                        <p className="text-xs text-gray-500">
                          Confidence: {Math.round(parseFloat(threat.confidence) * 100)}%
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Alert Areas */}
            {alerts.map((alert: any) => {
              if (!alert.targetArea?.lat || !alert.targetArea?.lng) return null;
              
              const radius = alert.targetArea.radius || 5000; // Default 5km radius
              
              return (
                <Circle
                  key={`alert-${alert.id}`}
                  center={[alert.targetArea.lat, alert.targetArea.lng]}
                  radius={radius}
                  pathOptions={{
                    color: getAlertColor(alert.severity),
                    fillColor: getAlertColor(alert.severity),
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: getAlertColor(alert.severity) }}
                        className="text-white mb-2"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Alert Radius: {(radius / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            })}

            {/* User Location Accuracy Circle */}
            {location.latitude && location.longitude && location.accuracy && (
              <Circle
                center={[location.latitude, location.longitude]}
                radius={location.accuracy}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Map Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Safe Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Threats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-20 border border-red-500"></div>
              <span>Alert Areas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}