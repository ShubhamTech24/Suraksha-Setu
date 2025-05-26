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
      color: "bg-safe-green",
      borderColor: "border-l-safe-green",
      trend: "12% from yesterday",
      trendIcon: "↓",
      trendColor: "text-safe-green",
      shadowClass: "safe-glow",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports || 0,
      icon: TriangleAlert,
      color: "bg-warning-amber",
      borderColor: "border-l-warning-amber",
      trend: "Awaiting verification",
      trendIcon: "⏱",
      trendColor: "text-warning-amber",
      shadowClass: "",
    },
    {
      title: "AI Confidence",
      value: `${stats?.aiConfidence || 97.3}%`,
      icon: Brain,
      color: "bg-ai-purple",
      borderColor: "border-l-ai-purple",
      trend: "Pattern analysis active",
      trendIcon: "📈",
      trendColor: "text-ai-purple",
      shadowClass: "ai-glow",
    },
    {
      title: "Safe Zones",
      value: stats?.safeZones || 0,
      icon: MapPin,
      color: "bg-navy",
      borderColor: "border-l-navy",
      trend: "Within 5km radius",
      trendIcon: "🗺",
      trendColor: "text-navy",
      shadowClass: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className={`border-l-4 ${stat.borderColor} ${stat.shadowClass}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className={`${stat.trendColor} mr-1`}>{stat.trendIcon}</span>
              {stat.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
