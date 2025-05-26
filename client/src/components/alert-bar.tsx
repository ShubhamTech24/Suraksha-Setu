import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";

export function AlertBar() {
  const { data: alerts } = useQuery({
    queryKey: [API_ENDPOINTS.ALERTS],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Determine current threat level based on active alerts
  const getCurrentThreatLevel = () => {
    if (!alerts || alerts.length === 0) {
      return { level: "LOW", color: "bg-safe-green", icon: CheckCircle };
    }

    const hasEmergency = alerts.some((alert: any) => alert.severity === "emergency");
    const hasAlert = alerts.some((alert: any) => alert.severity === "alert");
    const hasWarning = alerts.some((alert: any) => alert.severity === "warning");

    if (hasEmergency) {
      return { level: "CRITICAL", color: "bg-alert-red", icon: AlertCircle };
    } else if (hasAlert) {
      return { level: "HIGH", color: "bg-warning-amber", icon: AlertTriangle };
    } else if (hasWarning) {
      return { level: "MEDIUM", color: "bg-warning-amber", icon: AlertTriangle };
    }

    return { level: "LOW", color: "bg-safe-green", icon: CheckCircle };
  };

  const { level, color, icon: Icon } = getCurrentThreatLevel();
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className={`${color} text-white px-4 py-2 text-center text-sm font-medium`}>
      <Icon size={16} className="inline mr-2" />
      Current Threat Level:{" "}
      <span className="font-bold">{level}</span> - Last Updated:{" "}
      <span>{currentTime} IST</span>
    </div>
  );
}
