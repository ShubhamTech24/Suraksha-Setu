import { Shield, TriangleAlert, Brain, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.DASHBOARD_STATS],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Threats",
      value: stats?.activeThreats || 0,
      icon: Shield,
      gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
      iconBg: "bg-green-500",
      trend: "12% from yesterday",
      trendIcon: "↓",
      trendColor: "text-green-600",
      description: "Current security incidents",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports || 0,
      icon: TriangleAlert,
      gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
      iconBg: "bg-amber-500",
      trend: "Awaiting verification",
      trendIcon: "⏱",
      trendColor: "text-amber-600",
      description: "Reports under review",
    },
    {
      title: "AI Confidence",
      value: `${stats?.aiConfidence || 97.3}%`,
      icon: Brain,
      gradient: "bg-gradient-to-br from-purple-400 to-indigo-600",
      iconBg: "bg-purple-500",
      trend: "Pattern analysis active",
      trendIcon: "📈",
      trendColor: "text-purple-600",
      description: "System reliability",
    },
    {
      title: "Safe Zones",
      value: stats?.safeZones || 0,
      icon: MapPin,
      gradient: "bg-gradient-to-br from-blue-400 to-cyan-600",
      iconBg: "bg-blue-500",
      trend: "Within 5km radius",
      trendIcon: "🗺",
      trendColor: "text-blue-600",
      description: "Available nearby",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <div className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center">
              <span className={`${stat.trendColor} mr-2 text-lg`}>{stat.trendIcon}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
