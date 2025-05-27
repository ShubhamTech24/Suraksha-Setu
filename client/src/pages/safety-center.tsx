import { useState } from "react";
import { Header } from "@/components/header";
import { AdvancedEducationCenter } from "@/components/advanced-education-center";
import { EnhancedLocationSelector } from "@/components/enhanced-location-selector";
import { RealTimeThreatMonitor } from "@/components/real-time-threat-monitor";
import { EnhancedAlertManagement } from "@/components/enhanced-alert-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, MapPin, AlertTriangle, Bell } from "lucide-react";

export default function SafetyCenter() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const handleLocationChange = (lat: number, lng: number, name: string) => {
    setSelectedLocation({ lat, lng, name });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced Safety Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive safety education, real-time threat monitoring, and emergency management
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="education" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Safety Education
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Safe Zones
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Threat Monitor
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alert Management
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="education" className="space-y-6">
              <AdvancedEducationCenter />
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedLocationSelector
                  onLocationChange={handleLocationChange}
                  currentLocation={selectedLocation}
                />
                
                {selectedLocation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        Location Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                            Selected Location
                          </h3>
                          <p className="text-blue-600 dark:text-blue-300 mt-1">
                            {selectedLocation.name}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">15</div>
                            <div className="text-sm text-green-800 dark:text-green-200">Safe Zones</div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">2.3 km</div>
                            <div className="text-sm text-orange-800 dark:text-orange-200">Nearest Zone</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="threats" className="space-y-6">
              <RealTimeThreatMonitor />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <EnhancedAlertManagement />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}