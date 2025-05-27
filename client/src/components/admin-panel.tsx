import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Calendar,
  Send,
  Settings,
  LogOut
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./auth-context";

interface Report {
  id: number;
  threatType: string;
  description: string;
  urgencyLevel: string;
  status: string;
  createdAt: string;
  userId?: number;
}

interface ChatMessage {
  id: string;
  senderId: number;
  receiverId?: number;
  message: string;
  messageType: string;
  createdAt: string;
  isRead: boolean;
}

export function AdminPanel() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();

  // Fetch all reports for admin review
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['/api/admin/reports'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch chat messages
  const { data: chatMessages = [], isLoading: chatLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/admin/chat'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, comment }: { reportId: number; status: string; comment?: string }) => {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminComment: comment }),
      });
      if (!response.ok) throw new Error('Failed to update report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      toast({ title: "Report updated successfully" });
      setAdminResponse("");
      setSelectedReport(null);
    },
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, receiverId }: { message: string; receiverId?: number }) => {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          receiverId, 
          messageType: 'text',
          senderId: 1 // Admin user ID
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chat'] });
      setChatMessage("");
      setReplyToMessage(null);
      toast({ title: "Message sent successfully" });
    },
  });

  const handleReportAction = (reportId: number, status: string) => {
    updateReportMutation.mutate({ 
      reportId, 
      status, 
      comment: adminResponse 
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    sendMessageMutation.mutate({
      message: chatMessage,
      receiverId: replyToMessage?.senderId // Reply to the original sender
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", label: "Pending" },
      investigating: { color: "bg-blue-500", label: "Investigating" },
      verified: { color: "bg-green-500", label: "Verified" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: { color: "bg-green-100 text-green-800", label: "Low" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { color: "bg-orange-100 text-orange-800", label: "High" },
      critical: { color: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.low;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage security reports and communicate with field personnel
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Welcome, {user?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === 'admin' ? 'System Administrator' : 'User'}
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>Security Reports</span>
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center space-x-2">
              <MessageSquare size={16} />
              <span>Emergency Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>System Control</span>
            </TabsTrigger>
          </TabsList>

          {/* Reports Management */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reports List */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="glass-card backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="text-orange-500" size={20} />
                      <span>Incoming Security Reports</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {reportsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No reports pending review
                      </div>
                    ) : (
                      reports.map((report: Report) => (
                        <Card 
                          key={report.id} 
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedReport?.id === report.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => setSelectedReport(report)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getUrgencyBadge(report.urgencyLevel)}
                                {getStatusBadge(report.status)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar size={14} className="mr-1" />
                                {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {report.threatType.replace('_', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {report.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Report Details & Actions */}
              <div className="space-y-4">
                <Card className="glass-card backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="text-blue-500" size={20} />
                      <span>Report Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReport ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            {getUrgencyBadge(selectedReport.urgencyLevel)}
                            {getStatusBadge(selectedReport.status)}
                          </div>
                          <h3 className="font-semibold">
                            {selectedReport.threatType.replace('_', ' ').toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedReport.description}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Admin Response:</label>
                          <Textarea
                            placeholder="Add your response or instructions..."
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleReportAction(selectedReport.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={updateReportMutation.isPending}
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Verify
                          </Button>
                          <Button
                            onClick={() => handleReportAction(selectedReport.id, 'investigating')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={updateReportMutation.isPending}
                          >
                            <Clock size={16} className="mr-2" />
                            Investigate
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleReportAction(selectedReport.id, 'rejected')}
                          variant="destructive"
                          className="w-full"
                          disabled={updateReportMutation.isPending}
                        >
                          Reject Report
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a report to review
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Emergency Communications */}
          <TabsContent value="communications" className="space-y-6">
            <Card className="glass-card backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="text-green-500" size={20} />
                  <span>Emergency Communication Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto custom-scrollbar">
                    {chatLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No messages yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(chatMessages as ChatMessage[]).map((message: ChatMessage) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === 1 ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className="flex flex-col max-w-xs lg:max-w-md">
                              {message.senderId !== 1 && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <User size={14} className="text-red-500" />
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                    CIVILIAN EMERGENCY
                                  </span>
                                  {message.messageType === 'emergency' && (
                                    <Badge className="bg-red-100 text-red-800 text-xs px-1 py-0">
                                      URGENT
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  message.senderId === 1
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-50 dark:bg-red-900/30 text-gray-900 dark:text-white border-l-4 border-red-500'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <p className={`text-xs ${
                                    message.senderId === 1 ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                  </p>
                                  {message.senderId !== 1 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setReplyToMessage(message)}
                                      className="text-xs px-2 py-1 h-6"
                                    >
                                      Reply
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reply Context */}
                  {replyToMessage && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Replying to civilian emergency message:
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            "{replyToMessage.message}"
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyToMessage(null)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder={replyToMessage ? "Type your response to the civilian..." : "Type emergency response message..."}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || sendMessageMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send size={16} />
                      {sendMessageMutation.isPending && (
                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Security System</span>
                      <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Analysis</span>
                      <Badge className="bg-green-500 text-white">ONLINE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Communication Network</span>
                      <Badge className="bg-green-500 text-white">STABLE</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Broadcast Alert
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Generate Report
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Safe Zones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}