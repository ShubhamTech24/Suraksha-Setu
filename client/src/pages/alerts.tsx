import { useState } from "react";
import { Header } from "@/components/header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TriangleAlert, Info, Check, Search, Filter, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  targetArea?: {
    lat: number;
    lng: number;
    address?: string;
  };
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function Alerts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const { data: alerts, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.ALERTS],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'new_alert' || data.type === 'threat_alert') {
        toast({
          title: "New Alert",
          description: data.data.title || "A new alert has been issued",
          variant: data.data.severity === 'emergency' ? 'destructive' : 'default',
        });
      }
    },
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
          textColor: 'text-alert-red',
        };
      case 'alert':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-l-warning-amber',
          iconColor: 'bg-warning-amber',
          icon: TriangleAlert,
          badgeVariant: 'default' as const,
          textColor: 'text-warning-amber',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-l-warning-amber',
          iconColor: 'bg-warning-amber',
          icon: TriangleAlert,
          badgeVariant: 'secondary' as const,
          textColor: 'text-warning-amber',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-l-blue-500',
          iconColor: 'bg-blue-500',
          icon: Info,
          badgeVariant: 'outline' as const,
          textColor: 'text-blue-500',
        };
      default:
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-l-safe-green',
          iconColor: 'bg-safe-green',
          icon: Check,
          badgeVariant: 'outline' as const,
          textColor: 'text-safe-green',
        };
    }
  };

  const filteredAlerts = alerts?.filter((alert: Alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && alert.isActive) ||
                         (statusFilter === "expired" && !alert.isActive);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  }) || [];

  const activeAlertsCount = alerts?.filter((alert: Alert) => alert.isActive).length || 0;
  const emergencyAlertsCount = alerts?.filter((alert: Alert) => 
    alert.isActive && alert.severity === 'emergency'
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Alert Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage security alerts in real-time
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-saffron">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Alerts
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {alerts?.length || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-saffron" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-safe-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Alerts
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {activeAlertsCount}
                  </p>
                </div>
                <TriangleAlert className="h-8 w-8 text-safe-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-alert-red">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Emergency Alerts
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {emergencyAlertsCount}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-alert-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter size={20} />
              <span>Filter Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alert Feed</span>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-safe-green rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live Updates</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Check className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Alerts Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {alerts?.length === 0 
                    ? "No alerts have been issued yet" 
                    : "No alerts match your current filters"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredAlerts.map((alert: Alert) => {
                  const config = getSeverityConfig(alert.severity);
                  const Icon = config.icon;
                  const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();
                  
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start space-x-4 p-4 ${config.bgColor} rounded-lg border-l-4 ${config.borderColor} transition-all hover:shadow-md ${
                        isExpired ? 'opacity-60' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 ${config.iconColor} rounded-full flex items-center justify-center flex-shrink-0 ${
                        !isExpired && alert.severity === 'emergency' ? 'animate-pulse' : ''
                      }`}>
                        <Icon className="text-white" size={16} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {alert.message}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={config.badgeVariant}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              
                              {alert.isActive ? (
                                <Badge variant="outline" className="text-safe-green border-safe-green">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500 border-gray-500">
                                  Inactive
                                </Badge>
                              )}
                              
                              {alert.targetArea && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin size={12} className="mr-1" />
                                  <span className="font-mono">
                                    {alert.targetArea.lat.toFixed(4)}, {alert.targetArea.lng.toFixed(4)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <Clock size={12} className="mr-1" />
                              <span>
                                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            
                            {alert.expiresAt && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {isExpired ? 'Expired' : 'Expires'} {formatDistanceToNow(new Date(alert.expiresAt), { addSuffix: true })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
