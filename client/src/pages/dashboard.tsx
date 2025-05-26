import { Header } from "@/components/header";
import { AlertBar } from "@/components/alert-bar";
import { DashboardStats } from "@/components/dashboard-stats";
import { RealtimeAlerts } from "@/components/realtime-alerts";
import { QuickActions } from "@/components/quick-actions";
import { LeafletSafetyMap } from "@/components/leaflet-safety-map";
import { ReportingForm } from "@/components/reporting-form";
import { EducationCenter } from "@/components/education-center";
import { CommunicationCenter } from "@/components/communication-center";
import { MobileNavigation } from "@/components/mobile-navigation";
import { NetworkStatusMonitor } from "@/components/network-status";
import { LocationSelector } from "@/components/location-selector";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useLocationContext } from "@/hooks/use-location-context";

export default function Dashboard() {
  const { toast } = useToast();
  const { selectedLocation, setSelectedLocation } = useLocationContext();

  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'new_alert' || data.type === 'threat_alert') {
        toast({
          title: "New Alert",
          description: data.data.title || "A new threat alert has been issued",
          variant: data.data.severity === 'emergency' ? 'destructive' : 'default',
        });
      }
    },
    onConnect: () => {
      console.log("Connected to real-time updates");
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <AlertBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SurakshaSetu
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">
            Advanced Security Monitoring & Alert System
          </p>
        </div>

        <DashboardStats />
        
        {/* Three components in horizontal layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActions />
          <LocationSelector 
            onLocationChange={setSelectedLocation}
            currentLocation={selectedLocation}
          />
          <NetworkStatusMonitor />
        </div>

        {/* Alerts section takes full width */}
        <div className="mb-8">
          <RealtimeAlerts />
        </div>
        
        <div className="mt-8">
          <LeafletSafetyMap />
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReportingForm />
          <EducationCenter />
        </div>
        
        <div className="mt-8">
          <CommunicationCenter />
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
