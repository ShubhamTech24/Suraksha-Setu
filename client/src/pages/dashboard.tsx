import { Header } from "@/components/header";
import { AlertBar } from "@/components/alert-bar";
import { DashboardStats } from "@/components/dashboard-stats";
import { RealtimeAlerts } from "@/components/realtime-alerts";
import { QuickActions } from "@/components/quick-actions";
import { InteractiveMap } from "@/components/interactive-map";
import { ReportingForm } from "@/components/reporting-form";
import { EducationCenter } from "@/components/education-center";
import { CommunicationCenter } from "@/components/communication-center";
import { MobileNavigation } from "@/components/mobile-navigation";
import { LocationTracker } from "@/components/location-tracker";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <AlertBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <RealtimeAlerts />
          </div>
          <div className="space-y-8">
            <QuickActions />
            <LocationTracker />
          </div>
        </div>
        
        <div className="mt-8">
          <InteractiveMap />
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
