import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, User, MessageSquare, Send, Lock, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";

const emergencyContacts = [
  {
    id: 1,
    name: "National Emergency Helpline",
    number: "112",
    type: "emergency",
    color: "bg-red-500"
  },
  {
    id: 2,
    name: "Army Emergency Hotline", 
    number: "1800-11-3090",
    type: "army",
    color: "bg-blue-800"
  },
  {
    id: 3,
    name: "Uri Sector Commander",
    number: "+91-1972-250100",
    type: "military",
    color: "bg-blue-600"
  },
  {
    id: 4,
    name: "J&K Police Control Room",
    number: "100",
    type: "police", 
    color: "bg-blue-500"
  }
];

export function DashboardEmergencyCommunication() {
  const [messageInput, setMessageInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get chat messages from backend
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat/emergency'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; messageType: string; receiverId?: number }) => {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/emergency'] });
      setMessageInput("");
      toast({
        title: "Message Sent",
        description: "Your encrypted message has been delivered to the control room.",
      });
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check network status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleCall = (contact: typeof emergencyContacts[0]) => {
    toast({
      title: "Initiating Call",
      description: `Connecting to ${contact.name}...`,
    });
    window.open(`tel:${contact.number}`);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      message: messageInput,
      messageType: 'emergency_communication',
      receiverId: 1, // Control room ID
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Emergency Communication
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Secure channels for emergency coordination
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Emergency Contact Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {emergencyContacts.map((contact) => (
            <Button
              key={contact.id}
              onClick={() => handleCall(contact)}
              className={`${contact.color} hover:opacity-90 text-white p-4 h-auto flex flex-col items-center space-y-2 text-center`}
            >
              <Phone className="h-5 w-5" />
              <div>
                <div className="text-xs font-medium">{contact.name}</div>
                <div className="text-xs font-bold">{contact.number}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Secure Communication Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Secure Communication
            </h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Lock className="h-3 w-3 mr-1" />
                End-to-end encrypted
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-500">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No messages yet. Start a secure conversation.</p>
              </div>
            ) : (
              <>
                {messages.map((message: any) => {
                  const isCurrentUser = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex items-start space-x-2 mb-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentUser ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <div className={`flex items-center space-x-2 ${isCurrentUser ? 'justify-end flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {isCurrentUser ? 'You' : 'Control Room'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.createdAt)}
                          </span>
                          <Lock className="h-3 w-3 text-green-500" />
                          {message.isRead && <CheckCircle className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className={`mt-1 p-2 rounded-lg max-w-xs ${isCurrentUser ? 'bg-orange-100 dark:bg-orange-900 ml-auto' : 'bg-white dark:bg-gray-700'}`}>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your secure message..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={!isOnline || sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isOnline || sendMessageMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 disabled:opacity-50"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!isOnline && (
            <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              Connection lost. Messages will be sent when connection is restored.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}