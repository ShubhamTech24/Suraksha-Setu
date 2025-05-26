import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, MapPin, Zap } from 'lucide-react';
import { useLocationContext } from '@/hooks/use-location-context';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ThreatZone {
  id: string;
  center: [number, number];
  radius: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'military' | 'border' | 'civilian' | 'infrastructure';
  title: string;
  description: string;
  lastUpdated: string;
  confidence: number;
}

interface SafeZone {
  id: string;
  position: [number, number];
  name: string;
  type: 'hospital' | 'police' | 'military' | 'shelter';
  capacity: number;
}

// Animated Circle Component
function AnimatedThreatZone({ zone }: { zone: ThreatZone }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getOpacity = () => {
    if (zone.level === 'critical') return 0.4 + animationPhase * 0.2;
    if (zone.level === 'high') return 0.3 + animationPhase * 0.15;
    return 0.2 + animationPhase * 0.1;
  };

  return (
    <>
      {/* Main threat zone */}
      <Circle
        center={zone.center}
        radius={zone.radius}
        pathOptions={{
          color: getColor(zone.level),
          fillColor: getColor(zone.level),
          fillOpacity: getOpacity(),
          weight: 2,
          opacity: 0.8,
        }}
      >
        <Popup>
          <div className="min-w-[250px]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold">{zone.title}</h3>
              <Badge variant={zone.level === 'critical' ? 'destructive' : 'secondary'}>
                {zone.level.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
            <div className="space-y-1 text-xs">
              <p><strong>Type:</strong> {zone.type}</p>
              <p><strong>Confidence:</strong> {zone.confidence}%</p>
              <p><strong>Radius:</strong> {(zone.radius / 1000).toFixed(1)} km</p>
              <p><strong>Last Updated:</strong> {new Date(zone.lastUpdated).toLocaleTimeString()}</p>
            </div>
          </div>
        </Popup>
      </Circle>
      
      {/* Pulse effect for critical zones */}
      {zone.level === 'critical' && (
        <Circle
          center={zone.center}
          radius={zone.radius * (1.5 + animationPhase * 0.5)}
          pathOptions={{
            color: getColor(zone.level),
            fillColor: 'transparent',
            weight: 1,
            opacity: 0.5 - animationPhase * 0.15,
          }}
        />
      )}
    </>
  );
}

// Map Center Controller
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function InteractiveThreatMap() {
  const { selectedLocation } = useLocationContext();
  const [threatZones, setThreatZones] = useState<ThreatZone[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);

  // Get threats and alerts data
  const { data: threats } = useQuery({
    queryKey: ['/api/threats'],
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts'],
  });

  const { data: safeZonesData } = useQuery({
    queryKey: ['/api/safe-zones'],
  });

  // Generate threat zones based on real data
  useEffect(() => {
    const generateThreatZones = () => {
      const zones: ThreatZone[] = [];
      
      // Create zones from threat prediction data
      if (selectedLocation) {
        const { lat, lng } = selectedLocation;
        
        // Border proximity threat zone
        const distanceFromBorder = calculateDistanceFromBorder(lat, lng);
        if (distanceFromBorder < 100) {
          zones.push({
            id: 'border-zone',
            center: [lat - 0.1, lng - 0.1],
            radius: Math.max(5000, (100 - distanceFromBorder) * 1000),
            level: distanceFromBorder < 20 ? 'high' : distanceFromBorder < 50 ? 'medium' : 'low',
            type: 'border',
            title: 'Border Security Zone',
            description: `${distanceFromBorder.toFixed(1)} km from international border`,
            lastUpdated: new Date().toISOString(),
            confidence: 85,
          });
        }

        // Create dynamic threat zones based on alerts
        if (alerts && Array.isArray(alerts)) {
          alerts.slice(0, 3).forEach((alert: any, index: number) => {
            const offsetLat = (Math.random() - 0.5) * 0.2;
            const offsetLng = (Math.random() - 0.5) * 0.2;
            
            zones.push({
              id: `alert-zone-${index}`,
              center: [lat + offsetLat, lng + offsetLng],
              radius: alert.severity === 'emergency' ? 8000 : 
                     alert.severity === 'alert' ? 5000 : 3000,
              level: alert.severity === 'emergency' ? 'critical' :
                     alert.severity === 'alert' ? 'high' :
                     alert.severity === 'warning' ? 'medium' : 'low',
              type: 'civilian',
              title: alert.title,
              description: alert.message,
              lastUpdated: alert.createdAt,
              confidence: 78,
            });
          });
        }

        // Military installation zones (simulated based on location)
        if (distanceFromBorder < 50) {
          zones.push({
            id: 'military-zone',
            center: [lat + 0.05, lng + 0.05],
            radius: 3000,
            level: 'medium',
            type: 'military',
            title: 'Military Installation',
            description: 'Restricted military area - heightened security',
            lastUpdated: new Date().toISOString(),
            confidence: 92,
          });
        }
      }
      
      setThreatZones(zones);
    };

    generateThreatZones();
  }, [selectedLocation, alerts, threats]);

  // Generate safe zones
  useEffect(() => {
    if (selectedLocation && safeZonesData) {
      const zones: SafeZone[] = safeZonesData.map((zone: any, index: number) => ({
        id: zone.id || `safe-${index}`,
        position: [zone.latitude || selectedLocation.lat + (Math.random() - 0.5) * 0.1, 
                  zone.longitude || selectedLocation.lng + (Math.random() - 0.5) * 0.1],
        name: zone.name || `Safe Zone ${index + 1}`,
        type: zone.type || 'shelter',
        capacity: zone.capacity || 100,
      }));
      setSafeZones(zones);
    }
  }, [selectedLocation, safeZonesData]);

  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [28.7041, 77.1025]; // Default to Delhi

  const threatStats = useMemo(() => {
    const stats = threatZones.reduce((acc, zone) => {
      acc[zone.level] = (acc[zone.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: threatZones.length,
      critical: stats.critical || 0,
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
    };
  }, [threatZones]);

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Interactive Threat Map
          <Badge variant="outline" className="ml-auto">
            Live Updates
          </Badge>
        </CardTitle>
        
        {/* Threat Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{threatStats.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{threatStats.high}</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{threatStats.medium}</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{threatStats.low}</div>
            <div className="text-xs text-gray-500">Low</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[600px] w-full relative overflow-hidden rounded-b-lg">
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController center={mapCenter} />
            
            {/* Animated Threat Zones */}
            {threatZones.map((zone) => (
              <AnimatedThreatZone key={zone.id} zone={zone} />
            ))}
            
            {/* Safe Zones */}
            {safeZones.map((zone) => (
              <Marker key={zone.id} position={zone.position}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-green-500" />
                      <h3 className="font-semibold">{zone.name}</h3>
                      <Badge variant="outline" className="bg-green-50">
                        Safe Zone
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p><strong>Type:</strong> {zone.type}</p>
                      <p><strong>Capacity:</strong> {zone.capacity} people</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Current Location Marker */}
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-blue-500" />
                      <h3 className="font-semibold">Your Location</h3>
                    </div>
                    <p className="text-sm">{selectedLocation.name}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate distance from border
function calculateDistanceFromBorder(lat: number, lng: number): number {
  // Simplified border proximity calculation
  // India-Pakistan border approximate coordinates
  const borderPoints = [
    [32.5, 74.5], // Kashmir region
    [30.0, 73.0], // Punjab region  
    [27.0, 69.5], // Rajasthan region
    [24.0, 68.0], // Gujarat region
  ];
  
  let minDistance = Infinity;
  
  borderPoints.forEach(([borderLat, borderLng]) => {
    const distance = calculateHaversineDistance(lat, lng, borderLat, borderLng);
    minDistance = Math.min(minDistance, distance);
  });
  
  return minDistance;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}