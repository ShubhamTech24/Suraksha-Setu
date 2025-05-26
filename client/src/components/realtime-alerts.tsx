import { Check, TriangleAlert, Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export function RealtimeAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.ALERTS],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-l-alert-red',
          iconColor: 'bg-alert-red',
          icon: AlertCircle,
          badgeVariant: 'destructive' as const,
        };
      case 'alert':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-l-warning-amber',
          iconColor: 'bg-warning-amber',
          icon: TriangleAlert,
          badgeVariant: 'default' as const,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-l-warning-amber',
          iconColor: 'bg-warning-amber',
          icon: TriangleAlert,
          badgeVariant: 'secondary' as const,
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-l-blue-500',
          iconColor: 'bg-blue-500',
          icon: Info,
          badgeVariant: 'outline' as const,
        };
      default:
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-l-safe-green',
          iconColor: 'bg-safe-green',
          icon: Check,
          badgeVariant: 'outline' as const,
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Alerts</span>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="w-8 h-4" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-Time Alerts</span>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-safe-green rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <Check className="mx-auto h-12 w-12 text-safe-green mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Clear</h3>
            <p className="text-gray-600 dark:text-gray-400">No active alerts at this time</p>
          </div>
        ) : (
          alerts.map((alert: Alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-4 p-4 ${config.bgColor} rounded-lg border-l-4 ${config.borderColor}`}
              >
                <div className={`w-10 h-10 ${config.iconColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {alert.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={config.badgeVariant}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    {alert.location && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        Lat: {alert.location.lat.toFixed(4)}, Lng: {alert.location.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
