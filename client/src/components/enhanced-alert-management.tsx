import { useState, useEffect } from "react";
import { AlertTriangle, Bell, MapPin, Clock, Filter, Search, RefreshCw, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  type: 'weather' | 'security' | 'health' | 'infrastructure' | 'natural_disaster';
  location: {
    state: string;
    district: string;
    coordinates: { lat: number; lng: number };
  };
  issuedBy: string;
  timestamp: string;
  expiresAt: string;
  affectedAreas: string[];
  actionRequired: string[];
  isActive: boolean;
}

// Comprehensive Indian emergency alerts data
const indianEmergencyAlerts: EmergencyAlert[] = [
  {
    id: "ALERT_001",
    title: "High Security Alert - Border Areas",
    description: "Increased military activity reported along LOC. Citizens advised to stay indoors and avoid border areas.",
    severity: "emergency",
    type: "security",
    location: {
      state: "Jammu & Kashmir",
      district: "Kupwara",
      coordinates: { lat: 34.5268, lng: 74.2467 }
    },
    issuedBy: "Border Security Force",
    timestamp: "2025-01-27T17:30:00+05:30",
    expiresAt: "2025-01-28T06:00:00+05:30",
    affectedAreas: ["Kupwara", "Baramulla", "Border villages"],
    actionRequired: [
      "Stay indoors until further notice",
      "Keep emergency supplies ready",
      "Monitor official communications"
    ],
    isActive: true
  },
  {
    id: "ALERT_002", 
    title: "Severe Weather Warning - Heavy Snowfall",
    description: "Heavy snowfall expected in Kashmir valley. Travel restrictions in effect.",
    severity: "warning",
    type: "weather",
    location: {
      state: "Jammu & Kashmir",
      district: "Srinagar",
      coordinates: { lat: 34.0837, lng: 74.7973 }
    },
    issuedBy: "India Meteorological Department",
    timestamp: "2025-01-27T16:45:00+05:30",
    expiresAt: "2025-01-28T18:00:00+05:30",
    affectedAreas: ["Srinagar", "Anantnag", "Pulwama", "Budgam"],
    actionRequired: [
      "Avoid unnecessary travel",
      "Stock essential supplies",
      "Keep heating arrangements ready"
    ],
    isActive: true
  },
  {
    id: "ALERT_003",
    title: "Cyber Security Alert - Phishing Campaign",
    description: "Widespread phishing attacks targeting government employees and citizens. Exercise caution with emails and links.",
    severity: "alert",
    type: "security",
    location: {
      state: "All India",
      district: "Multiple",
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    issuedBy: "CERT-In",
    timestamp: "2025-01-27T15:20:00+05:30",
    expiresAt: "2025-01-30T23:59:00+05:30",
    affectedAreas: ["All major cities", "Government offices", "Banking sector"],
    actionRequired: [
      "Verify sender before clicking links",
      "Update antivirus software",
      "Report suspicious emails"
    ],
    isActive: true
  },
  {
    id: "ALERT_004",
    title: "Flash Flood Warning - Coastal Areas",
    description: "Heavy rains causing flash floods in coastal regions. Evacuation advisory issued.",
    severity: "emergency",
    type: "natural_disaster",
    location: {
      state: "Kerala",
      district: "Ernakulam",
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    issuedBy: "District Collector",
    timestamp: "2025-01-27T14:15:00+05:30",
    expiresAt: "2025-01-28T12:00:00+05:30",
    affectedAreas: ["Kochi", "Aluva", "Perumbavoor", "Low-lying areas"],
    actionRequired: [
      "Move to higher ground immediately",
      "Avoid walking in flood water",
      "Contact emergency services if stranded"
    ],
    isActive: true
  },
  {
    id: "ALERT_005",
    title: "Air Quality Emergency - Severe Pollution",
    description: "Air quality index reaches hazardous levels. Health advisory in effect.",
    severity: "warning",
    type: "health",
    location: {
      state: "Delhi",
      district: "New Delhi",
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    issuedBy: "Delhi Pollution Control Committee",
    timestamp: "2025-01-27T13:30:00+05:30",
    expiresAt: "2025-01-29T00:00:00+05:30",
    affectedAreas: ["Central Delhi", "South Delhi", "NCR region"],
    actionRequired: [
      "Wear N95 masks outdoors",
      "Limit outdoor activities",
      "Keep windows closed"
    ],
    isActive: true
  },
  {
    id: "ALERT_006",
    title: "Power Grid Failure - Load Shedding",
    description: "Major power grid failure affecting multiple districts. Emergency power conservation measures in effect.",
    severity: "alert",
    type: "infrastructure",
    location: {
      state: "Uttar Pradesh",
      district: "Lucknow",
      coordinates: { lat: 26.8467, lng: 80.9462 }
    },
    issuedBy: "Uttar Pradesh Power Corporation",
    timestamp: "2025-01-27T12:45:00+05:30",
    expiresAt: "2025-01-28T08:00:00+05:30",
    affectedAreas: ["Lucknow", "Kanpur", "Agra", "Meerut"],
    actionRequired: [
      "Conserve electricity usage",
      "Keep backup power ready",
      "Avoid using high-power appliances"
    ],
    isActive: true
  },
  {
    id: "ALERT_007",
    title: "Earthquake Early Warning",
    description: "Seismic activity detected. Mild to moderate earthquake possible in the region.",
    severity: "warning",
    type: "natural_disaster",
    location: {
      state: "Himachal Pradesh",
      district: "Shimla",
      coordinates: { lat: 31.1048, lng: 77.1734 }
    },
    issuedBy: "National Center for Seismology",
    timestamp: "2025-01-27T11:20:00+05:30",
    expiresAt: "2025-01-27T23:59:00+05:30",
    affectedAreas: ["Shimla", "Solan", "Kullu", "Mandi"],
    actionRequired: [
      "Stay away from heavy objects",
      "Identify safe spots in buildings",
      "Keep emergency kit ready"
    ],
    isActive: true
  },
  {
    id: "ALERT_008",
    title: "Cyclone Warning - Eastern Coast",
    description: "Tropical cyclone approaching eastern coastline. Evacuation orders issued for vulnerable areas.",
    severity: "emergency",
    type: "weather",
    location: {
      state: "Odisha",
      district: "Puri",
      coordinates: { lat: 19.8135, lng: 85.8312 }
    },
    issuedBy: "Indian Meteorological Department",
    timestamp: "2025-01-27T10:30:00+05:30",
    expiresAt: "2025-01-28T20:00:00+05:30",
    affectedAreas: ["Puri", "Bhadrak", "Kendrapara", "Coastal villages"],
    actionRequired: [
      "Evacuate to designated shelters",
      "Secure loose objects",
      "Stock food and water for 3 days"
    ],
    isActive: true
  }
];

export function EnhancedAlertManagement() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(indianEmergencyAlerts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'alert': return 'bg-orange-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return '🛡️';
      case 'weather': return '🌦️';
      case 'health': return '🏥';
      case 'infrastructure': return '⚡';
      case 'natural_disaster': return '🌪️';
      default: return '⚠️';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.location.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
    const matchesType = selectedType === "all" || alert.type === selectedType;
    const matchesState = selectedState === "all" || alert.location.state === selectedState;
    
    return matchesSearch && matchesSeverity && matchesType && matchesState;
  });

  const activeAlerts = filteredAlerts.filter(alert => alert.isActive);
  const emergencyAlerts = activeAlerts.filter(alert => alert.severity === 'emergency');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'alert');

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueStates = () => {
    const states = Array.from(new Set(alerts.map(alert => alert.location.state)));
    return states.sort();
  };

  const refreshAlerts = () => {
    setLastUpdated(new Date());
    // In a real app, this would fetch fresh data from the API
  };

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Emergency</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{emergencyAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Critical</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Active</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Last Updated</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {lastUpdated.toLocaleTimeString('en-IN', { hour12: false })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Alert Management - All India
            </div>
            <Button onClick={refreshAlerts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {getUniqueStates().map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="w-full">
              <Volume2 className="h-4 w-4 mr-2" />
              Audio Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm truncate">{alert.title}</h3>
                        <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Location:</p>
                          <p className="font-medium">{alert.location.state}, {alert.location.district}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Issued by:</p>
                          <p className="font-medium">{alert.issuedBy}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Time:</p>
                          <p className="font-medium">{formatTime(alert.timestamp)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Expires:</p>
                          <p className="font-medium">{formatTime(alert.expiresAt)}</p>
                        </div>
                      </div>
                      
                      {alert.actionRequired.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Action Required:</p>
                          <ul className="text-xs space-y-1">
                            {alert.actionRequired.slice(0, 2).map((action, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No alerts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}