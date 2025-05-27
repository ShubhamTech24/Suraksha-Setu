import { useState, useEffect } from "react";
import { AlertTriangle, Shield, Clock, MapPin, TrendingUp, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface ThreatLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  lastUpdated: string;
  location: string;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface RealTimeThreat {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  timestamp: string;
  verified: boolean;
}

export function RealTimeThreatMonitor() {
  const [currentThreat, setCurrentThreat] = useState<ThreatLevel>({
    level: 'HIGH',
    confidence: 85,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    }),
    location: 'Kashmir Valley',
    factors: [
      'Recent border activity detected',
      'Increased military movement',
      'Weather conditions affecting surveillance',
      'Intelligence reports of potential threats'
    ],
    trend: 'stable'
  });

  const [recentThreats, setRecentThreats] = useState<RealTimeThreat[]>([
    {
      id: '1',
      type: 'Border Intrusion',
      severity: 'high',
      location: 'LOC Sector',
      description: 'Suspicious movement detected near border fence',
      timestamp: '2 minutes ago',
      verified: true
    },
    {
      id: '2',
      type: 'Cyber Activity',
      severity: 'medium',
      location: 'Network Infrastructure',
      description: 'Unusual network traffic patterns identified',
      timestamp: '15 minutes ago',
      verified: false
    },
    {
      id: '3',
      type: 'Air Space Violation',
      severity: 'high',
      location: 'Northern Sector',
      description: 'Unidentified aircraft detected',
      timestamp: '32 minutes ago',
      verified: true
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThreat(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          hour12: false 
        }),
        confidence: Math.max(70, Math.min(95, prev.confidence + (Math.random() - 0.5) * 5))
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'HIGH': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'LOW': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getThreatBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Threat Level */}
      <Card className={`border-2 ${currentThreat.level === 'HIGH' ? 'border-orange-500' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Current Threat Level
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">Live</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                variant={getThreatBadgeColor(currentThreat.level) as any}
                className="text-lg px-4 py-2"
              >
                {currentThreat.level}
              </Badge>
              <div className="flex items-center gap-1">
                {getTrendIcon(currentThreat.trend)}
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {currentThreat.trend}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                Last Updated: {currentThreat.lastUpdated} IST
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <MapPin className="h-4 w-4" />
                {currentThreat.location}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Confidence Level</span>
              <span className="font-medium">{Math.round(currentThreat.confidence)}%</span>
            </div>
            <Progress value={currentThreat.confidence} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Contributing Factors:</h4>
            <ul className="space-y-1">
              {currentThreat.factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Threat Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Threat Activity
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Live monitoring of security incidents across India
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {recentThreats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getSeverityColor(threat.severity).replace('text-', 'bg-')}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{threat.type}</h4>
                    <Badge variant="outline" className="text-xs">
                      {threat.location}
                    </Badge>
                    {threat.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {threat.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{threat.timestamp}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(threat.severity)}`}
                    >
                      {threat.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              <span className="font-medium text-sm">Security Status</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              All monitoring systems operational. Continuous surveillance active across {currentThreat.location} region.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alert System
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium text-sm">SMS Alerts</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300">Active for your area</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium text-sm">Push Notifications</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300">Real-time updates enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}