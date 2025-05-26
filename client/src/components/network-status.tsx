import { useLocationService } from "@/hooks/use-location-service";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Wifi, Server, Activity, RefreshCw, AlertTriangle, Radio, Eye } from "lucide-react";
import { useState, useEffect } from "react";

export function NetworkStatusMonitor() {
  const locationService = useLocationService({
    autoStart: true,
    transmissionInterval: 30000,
    enableHistory: false,
  });

  const [connectionStatus, setConnectionStatus] = useState({
    websocket: 'disconnected',
    database: 'operational',
    lastPing: null as string | null,
    uptime: 0,
  });

  // Monitor WebSocket and network status
  useWebSocket({
    onMessage: () => {
      setConnectionStatus(prev => ({
        ...prev,
        websocket: 'connected',
        lastPing: new Date().toISOString(),
      }));
    },
    onConnect: () => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        websocket: 'connected',
        database: 'operational' 
      }));
    },
    onError: () => {
      setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
    },
    onDisconnect: () => {
      setConnectionStatus(prev => ({ ...prev, websocket: 'disconnected' }));
    },
  });

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getNetworkStatus = () => {
    if (connectionStatus.websocket === 'connected') 
      return { status: "SECURED", color: "green", className: "status-active glow-green" };
    if (connectionStatus.websocket === 'error') 
      return { status: "COMPROMISED", color: "red", className: "status-critical glow-red" };
    return { status: "OFFLINE", color: "gray", className: "" };
  };

  const networkStatus = getNetworkStatus();

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`military-panel ${networkStatus.className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg defense-text">
          <Shield className="h-5 w-5" />
          NETWORK STATUS
          <Badge 
            className={`ml-auto text-white ${
              networkStatus.color === "green" ? "bg-green-600" :
              networkStatus.color === "red" ? "bg-red-600" : "bg-gray-500"
            }`}
          >
            {networkStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium defense-text">
              <Radio className="h-4 w-4" />
              COMM LINK
            </div>
            <div className="text-sm">
              <div className={`font-medium ${
                connectionStatus.websocket === 'connected' ? 'text-green-600' : 
                connectionStatus.websocket === 'error' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {connectionStatus.websocket.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">
                Real-time Data Stream
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium defense-text">
              <Server className="h-4 w-4" />
              DATABASE
            </div>
            <div className="text-sm">
              <div className="font-medium text-green-600">
                {connectionStatus.database.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">
                Threat Intelligence DB
              </div>
            </div>
          </div>
        </div>

        {/* Transmission Status */}
        <div className="p-3 bg-muted/30 rounded-lg border border-green-200/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium defense-text">TRANSMISSION STATUS</div>
              <div className="text-xs text-muted-foreground">
                {locationService.isTracking ? (
                  <>
                    Last Update: {locationService.lastUpdate ? 
                      new Date(locationService.lastUpdate).toLocaleTimeString() : 'Initializing...'
                    }
                  </>
                ) : (
                  'Monitoring Disabled'
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={locationService.manualTransmit}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                SYNC
              </Button>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-medium defense-text">UPTIME</div>
            <div className="font-mono text-green-600">
              {formatUptime(connectionStatus.uptime)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium defense-text">LAST PING</div>
            <div className="font-mono text-blue-600">
              {connectionStatus.lastPing ? 
                new Date(connectionStatus.lastPing).toLocaleTimeString() : 
                'No Response'
              }
            </div>
          </div>
        </div>

        {/* Error Display */}
        {locationService.transmissionError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300 defense-text">
              TRANSMISSION ERROR: {locationService.transmissionError}
            </span>
          </div>
        )}

        {/* Security Indicators */}
        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/20">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium defense-text">SURVEILLANCE ACTIVE</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}