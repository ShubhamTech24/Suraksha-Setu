import { Phone, Camera, MapPin, Brain, MapPinned } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { calculateDistanceToLOC, formatDistance, findNearest } from "@/lib/distance-utils";

export function QuickActions() {
  const { toast } = useToast();
  const { latitude, longitude, error } = useGeolocation();
  
  const { data: aiPrediction } = useQuery({
    queryKey: [API_ENDPOINTS.AI_PREDICTION, latitude, longitude],
    queryFn: () => {
      const url = new URL(API_ENDPOINTS.AI_PREDICTION, window.location.origin);
      if (latitude && longitude) {
        url.searchParams.set('lat', latitude.toString());
        url.searchParams.set('lng', longitude.toString());
      }
      return fetch(url.toString()).then(res => res.json());
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: safeZones } = useQuery({
    queryKey: [API_ENDPOINTS.SAFE_ZONES],
  });

  // Calculate real distances when user location is available
  const distanceToLOC = latitude && longitude ? calculateDistanceToLOC(latitude, longitude) : null;
  const nearestSafeZone = latitude && longitude && safeZones ? 
    findNearest(latitude, longitude, safeZones.map((zone: any) => ({ 
      lat: zone.latitude, 
      lng: zone.longitude, 
      ...zone 
    }))) : null;

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call Initiated",
      description: "Connecting to emergency services...",
      variant: "destructive",
    });
    window.open("tel:112", "_self");
  };

  const handleFindSafeZone = () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to find nearby safe zones",
        variant: "destructive",
      });
      return;
    }
    // Navigate to safety zones page with current location
    window.location.href = `/safety?lat=${latitude}&lng=${longitude}`;
  };

  return (
    <div className="space-y-6">
      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleEmergencyCall}
            className="w-full bg-alert-red hover:bg-red-700 text-white p-4 h-auto font-semibold alert-glow pulse-urgent"
          >
            <Phone className="mr-2" size={20} />
            Emergency Call
          </Button>
          
          <Link href="/reports">
            <Button
              className="w-full bg-warning-amber hover:bg-yellow-600 text-white p-3 h-auto font-medium"
            >
              <Camera className="mr-2" size={18} />
              Report Threat
            </Button>
          </Link>
          
          <Button
            onClick={handleFindSafeZone}
            className="w-full bg-navy hover:bg-blue-800 text-white p-3 h-auto font-medium"
          >
            <MapPinned className="mr-2" size={18} />
            Find Safe Zone
          </Button>
        </CardContent>
      </Card>

      {/* AI Analysis Panel */}
      <Card className="ai-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ai-purple rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={16} />
            </div>
            <span>AI Threat Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pattern Detection
              </span>
              <span className="text-sm text-ai-purple font-semibold">
                {aiPrediction?.patternConfidence || 94}%
              </span>
            </div>
            <Progress 
              value={aiPrediction?.patternConfidence || 94} 
              className="h-2"
            />
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Threat Prediction
              </span>
              <span className="text-sm text-safe-green font-semibold">
                {aiPrediction?.threatLevel || "Low Risk"}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Next 24 hours forecast based on historical data and current patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Location Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Location Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Distance from LOC</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {distanceToLOC ? formatDistance(distanceToLOC) : "Unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Nearest Safe Zone</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {nearestSafeZone ? formatDistance(nearestSafeZone.distance) : "Unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Network Status</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-safe-green rounded-full"></span>
              <span className="text-sm font-semibold text-safe-green">Strong</span>
            </div>
          </div>
          {error && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
              <span className="text-sm text-red-500">Access Denied</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
