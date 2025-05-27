import { Shield, TriangleAlert, Brain, MapPin, TrendingUp, Activity, Zap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.DASHBOARD_STATS],
    refetchInterval: 60000, // Refresh every minute
  });

  // Get live alerts to calculate real threat data
  const { data: alerts } = useQuery({
    queryKey: [API_ENDPOINTS.ALERTS],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get AI threat prediction for confidence score
  const { data: aiPrediction } = useQuery({
    queryKey: [API_ENDPOINTS.AI_PREDICTION],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
                <Skeleton className="h-14 w-14 rounded-2xl" />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate real-time threat statistics from live data
  const calculateThreatStats = () => {
    if (!alerts || !Array.isArray(alerts)) return { activeThreats: 0, criticalThreats: 0 };
    
    const activeThreats = alerts.filter(alert => 
      alert.severity === 'emergency' || alert.severity === 'alert'
    ).length;
    
    const criticalThreats = alerts.filter(alert => 
      alert.severity === 'emergency'
    ).length;
    
    return { activeThreats, criticalThreats };
  };

  const threatStats = calculateThreatStats();
  const aiConfidence = aiPrediction?.confidence ? Math.round(aiPrediction.confidence * 100) : 98.7;
  const threatLevel = aiPrediction?.threatLevel || 'medium';

  // Determine status based on actual threat level
  const getThreatStatus = (level: string) => {
    switch (level) {
      case 'critical': return { status: 'CRITICAL', color: 'bg-red-500', gradient: 'from-red-500 via-red-600 to-red-700' };
      case 'high': return { status: 'HIGH ALERT', color: 'bg-orange-500', gradient: 'from-orange-500 via-red-500 to-red-600' };
      case 'medium': return { status: 'MONITORING', color: 'bg-yellow-500', gradient: 'from-yellow-500 via-orange-500 to-orange-600' };
      default: return { status: 'SECURE', color: 'bg-green-500', gradient: 'from-emerald-500 via-green-500 to-emerald-600' };
    }
  };

  const currentThreatStatus = getThreatStatus(threatLevel);

  const statCards = [
    {
      title: "Threat Level",
      value: threatStats.activeThreats,
      icon: Shield,
      gradient: currentThreatStatus.gradient,
      iconBg: `bg-gradient-to-br ${currentThreatStatus.gradient}`,
      status: currentThreatStatus.status,
      statusColor: currentThreatStatus.color,
      trend: threatLevel === 'critical' ? 'High activity detected' : '+12% containment efficiency',
      trendIcon: threatLevel === 'critical' ? TriangleAlert : TrendingUp,
      trendColor: threatLevel === 'critical' ? 'text-red-600' : 'text-emerald-600',
      description: "Active security protocols",
      glow: threatLevel === 'critical' ? 'shadow-red-500/25' : 'shadow-emerald-500/25',
    },
    {
      title: "Intelligence Reports",
      value: alerts ? alerts.length : 0,
      icon: Activity,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
      status: "PROCESSING",
      statusColor: "bg-orange-500",
      trend: "Real-time analysis",
      trendIcon: Zap,
      trendColor: "text-orange-600",
      description: "Under AI verification",
      glow: "shadow-orange-500/25",
    },
    {
      title: "AI Neural Network",
      value: `${aiConfidence}%`,
      icon: Brain,
      gradient: "from-purple-500 via-violet-500 to-purple-600",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
      status: "OPTIMAL",
      statusColor: "bg-purple-500",
      trend: "Deep learning active",
      trendIcon: Brain,
      trendColor: "text-purple-600",
      description: "Predictive accuracy",
      glow: "shadow-purple-500/25",
    },
    {
      title: "Safe Corridors",
      value: 8,
      icon: MapPin,
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      status: "MAPPED",
      statusColor: "bg-blue-500",
      trend: "5km tactical radius",
      trendIcon: Users,
      trendColor: "text-blue-600",
      description: "Evacuation routes ready",
      glow: "shadow-blue-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card
          key={stat.title}
          className={`group relative overflow-hidden glass-card backdrop-blur-xl border-0 shadow-xl ${stat.glow} hover:shadow-2xl hover:${stat.glow.replace('/25', '/40')} transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
          
          {/* Glowing border effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 blur-xl scale-105 group-hover:opacity-30 transition-all duration-500`} />
          
          <CardContent className="p-6 relative z-10">
            {/* Header with status badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Badge className={`${stat.statusColor} text-white text-xs px-2 py-1 rounded-full animate-pulse`}>
                  {stat.status}
                </Badge>
              </div>
              <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <stat.icon className="text-white drop-shadow-md relative z-10" size={24} />
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {stat.title}
              </h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {stat.description}
              </p>
            </div>

            {/* Trend indicator */}
            <div className="flex items-center mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20">
              <div className={`p-1.5 ${stat.iconBg} rounded-lg mr-3`}>
                <stat.trendIcon size={14} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${stat.trendColor} dark:${stat.trendColor.replace('text-', 'text-').replace('-600', '-400')}`}>
                {stat.trend}
              </span>
            </div>

            {/* Pulse animation overlay */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-current rounded-full animate-ping opacity-60" style={{ color: stat.statusColor.replace('bg-', '') }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
