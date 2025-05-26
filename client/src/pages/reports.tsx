import { useState } from "react";
import { Header } from "@/components/header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ReportingForm } from "@/components/reporting-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Search, Filter, Clock, MapPin, Eye, FileText, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: number;
  threatType: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  media?: string[];
  isAnonymous: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'investigating';
  aiAnalysis?: any;
  createdAt: string;
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.REPORTS],
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'text-safe-green',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          icon: CheckCircle,
          variant: 'default' as const,
        };
      case 'rejected':
        return {
          color: 'text-alert-red',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          icon: XCircle,
          variant: 'destructive' as const,
        };
      case 'investigating':
        return {
          color: 'text-warning-amber',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: AlertTriangle,
          variant: 'default' as const,
        };
      default: // pending
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          icon: Clock,
          variant: 'secondary' as const,
        };
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return { color: 'text-alert-red', variant: 'destructive' as const };
      case 'high':
        return { color: 'text-warning-amber', variant: 'default' as const };
      case 'medium':
        return { color: 'text-blue-500', variant: 'secondary' as const };
      default: // low
        return { color: 'text-gray-500', variant: 'outline' as const };
    }
  };

  const filteredReports = reports?.filter((report: Report) => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.threatType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || report.urgencyLevel === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  }) || [];

  const pendingCount = reports?.filter((r: Report) => r.status === 'pending').length || 0;
  const verifiedCount = reports?.filter((r: Report) => r.status === 'verified').length || 0;
  const investigatingCount = reports?.filter((r: Report) => r.status === 'investigating').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Threat Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Submit and track suspicious activity reports
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-saffron hover:bg-orange-600 text-white"
          >
            <Camera className="mr-2" size={16} />
            {showForm ? 'View Reports' : 'New Report'}
          </Button>
        </div>

        {showForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReportingForm />
            <Card>
              <CardHeader>
                <CardTitle>Reporting Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What to Report
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Suspicious aerial objects or drones</li>
                    <li>• Unusual movement near border areas</li>
                    <li>• Strange sounds or activities</li>
                    <li>• Cyber threats or propaganda</li>
                    <li>• Any potential security concerns</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Tips for Good Reports
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Be specific about time and location</li>
                    <li>• Include photos or videos if safe</li>
                    <li>• Describe what you observed clearly</li>
                    <li>• Report immediately for urgent threats</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Your Safety First
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Only report what you can safely observe. Do not put yourself at risk 
                    to gather information. Call emergency services (112) for immediate threats.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pending Review
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pendingCount}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning-amber">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Investigating
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {investigatingCount}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-warning-amber" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-safe-green">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Verified
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {verifiedCount}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-safe-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-saffron">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Reports
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reports?.length || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-saffron" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter size={20} />
                  <span>Filter Reports</span>
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
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgency
                    </label>
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Urgencies</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Reports Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {reports?.length === 0 
                        ? "No reports have been submitted yet" 
                        : "No reports match your current filters"
                      }
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-saffron hover:bg-orange-600 text-white"
                    >
                      Submit First Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredReports.map((report: Report) => {
                      const statusConfig = getStatusConfig(report.status);
                      const urgencyConfig = getUrgencyConfig(report.urgencyLevel);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={report.id}
                          className={`p-4 border rounded-lg hover:shadow-md transition-all ${statusConfig.bgColor}`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                              {report.isAnonymous ? (
                                <User className="text-gray-500" size={20} />
                              ) : (
                                <Camera className="text-gray-500" size={20} />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {report.threatType.charAt(0).toUpperCase() + report.threatType.slice(1)} Activity
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {report.description}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <StatusIcon className={`${statusConfig.color}`} size={16} />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant={statusConfig.variant}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                                
                                <Badge variant={urgencyConfig.variant}>
                                  {report.urgencyLevel.toUpperCase()}
                                </Badge>
                                
                                {report.isAnonymous && (
                                  <Badge variant="outline">Anonymous</Badge>
                                )}
                                
                                {report.media && report.media.length > 0 && (
                                  <Badge variant="outline">
                                    {report.media.length} file{report.media.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              
                              {report.location && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin size={12} className="mr-1" />
                                  <span className="font-mono">
                                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                                  </span>
                                </div>
                              )}
                              
                              {report.aiAnalysis && (
                                <div className="mt-2 p-2 bg-ai-purple bg-opacity-10 rounded text-xs">
                                  <span className="text-ai-purple font-medium">AI Analysis:</span>
                                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                                    Confidence: {(report.aiAnalysis.textAnalysis?.confidence * 100 || 0).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      
      <MobileNavigation />
    </div>
  );
}
