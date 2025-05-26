import { useLocationService } from "@/hooks/use-location-service";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Wifi, Server, Activity, RefreshCw, AlertTriangle, Radio } from "lucide-react";
import { useState, useEffect } from "react";

export function NetworkStatusMonitor() {
  const locationService = useLocationService({
    autoStart: true,
    transmissionInterval: 30000,
    enableHistory: true,
  });

  const [networkUpdates, setNetworkUpdates] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: 'disconnected',
    database: 'unknown',
    lastPing: null as string | null,
  });

  // Monitor WebSocket and network status
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'location_update') {
        setNetworkUpdates(prev => [data.data, ...prev.slice(0, 9)]);
      }
      setConnectionStatus(prev => ({
        ...prev,
        websocket: 'connected',
        lastPing: new Date().toISOString(),
      }));
    },
    onConnect: () => {
      setConnectionStatus(prev => ({ ...prev, websocket: 'connected' }));
    },
    onError: () => {
      setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
    },
    onDisconnect: () => {
      setConnectionStatus(prev => ({ ...prev, websocket: 'disconnected' }));
    },
  });

  const getNetworkStatus = () => {
    if (connectionStatus.websocket === 'connected') return { status: "SECURED", color: "green", icon: Shield };
    if (connectionStatus.websocket === 'error') return { status: "COMPROMISED", color: "red", icon: AlertTriangle };
    return { status: "OFFLINE", color: "gray", icon: Wifi };
  };

  const networkStatus = getNetworkStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5" />
            Real-Time Location Tracking
            <Badge 
              variant={locationStatus.color === "green" ? "default" : "secondary"}
              className={`ml-auto ${
                locationStatus.color === "green" ? "bg-green-500" :
                locationStatus.color === "yellow" ? "bg-yellow-500" :
                locationStatus.color === "red" ? "bg-red-500" : "bg-gray-500"
              } text-white`}
            >
              {locationStatus.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Current Location
              </div>
              {locationService.currentLocation.latitude && locationService.currentLocation.longitude ? (
                <div className="space-y-1 text-sm">
                  {/* City/Area Name */}
                  <div className="font-medium text-base">
                    {locationInfo.loading ? (
                      <span className="text-muted-foreground">Getting location...</span>
                    ) : locationInfo.error ? (
                      <span className="text-red-500">Location unavailable</span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400">
                        {locationInfo.city || "Unknown City"}
                        {locationInfo.district && locationInfo.district !== locationInfo.city && (
                          <span className="text-muted-foreground">, {locationInfo.district}</span>
                        )}
                      </span>
                    )}
                  </div>
                  {/* Coordinates */}
                  <div className="text-xs text-muted-foreground">
                    <div>Lat: {locationService.currentLocation.latitude.toFixed(6)}</div>
                    <div>Lng: {locationService.currentLocation.longitude.toFixed(6)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Location not available</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Satellite className="h-4 w-4" />
                GPS Accuracy
              </div>
              <div className="text-sm">
                {locationService.currentLocation.accuracy ? (
                  <div>
                    <span className="font-medium">
                      {formatAccuracy(locationService.currentLocation.accuracy)}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      (±{Math.round(locationService.currentLocation.accuracy)}m)
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unknown</span>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {locationService.currentLocation.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {locationService.currentLocation.error}
              </span>
            </div>
          )}

          {/* Transmission Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm font-medium">Live Tracking Status</div>
              <div className="text-xs text-muted-foreground">
                {locationService.isTracking ? (
                  <>
                    Last transmitted: {locationService.lastUpdate ? 
                      new Date(locationService.lastUpdate).toLocaleTimeString() : 'Never'
                    }
                  </>
                ) : (
                  'Tracking disabled'
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={locationService.refreshLocation}
                disabled={locationService.currentLocation.loading}
              >
                <RefreshCw className={`h-4 w-4 ${locationService.currentLocation.loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={locationService.isTracking ? locationService.stopTracking : locationService.startTracking}
                variant={locationService.isTracking ? "destructive" : "default"}
              >
                {locationService.isTracking ? 'Stop' : 'Start'} Tracking
              </Button>
            </div>
          </div>

          {/* Recent Location History */}
          {locationService.locationHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Location Updates</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {locationService.locationHistory.slice(0, 5).map((location, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-muted/30 rounded">
                    <span>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(location.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Updates from Other Users */}
      {locationUpdates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Location Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {locationUpdates.map((update, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <div>
                    <span className="font-medium">User {update.sessionId.slice(-6)}</span>
                    <span className="text-muted-foreground ml-2">
                      {update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}