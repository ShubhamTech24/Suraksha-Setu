import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, ShieldX, Ambulance, MessageSquare, Send, Lock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: number;
  name: string;
  type: 'emergency' | 'army' | 'police' | 'medical' | 'local';
  phoneNumber: string;
  location?: string;
  priority: number;
}

interface Message {
  id: string;
  sender: 'user' | 'control' | 'system';
  content: string;
  timestamp: string;
  encrypted: boolean;
}

export function CommunicationCenter() {
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'control',
      content: 'All sectors report normal. Maintain vigilance.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      encrypted: true,
    },
    {
      id: '2',
      sender: 'user',
      content: 'Sector 7 all clear. No unusual activity.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      encrypted: true,
    },
  ]);

  const { data: emergencyContacts } = useQuery({
    queryKey: [API_ENDPOINTS.EMERGENCY_CONTACTS],
  });

  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'secure_message') {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'control',
          content: data.message,
          timestamp: new Date().toISOString(),
          encrypted: true,
        };
        setMessages(prev => [newMessage, ...prev]);
      }
    },
  });

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return Phone;
      case 'army':
        return Shield;
      case 'police':
        return ShieldX;
      case 'medical':
        return Ambulance;
      default:
        return Phone;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-alert-red hover:bg-red-700';
      case 'army':
        return 'bg-navy hover:bg-blue-800';
      case 'police':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'medical':
        return 'bg-safe-green hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const handleCall = (contact: EmergencyContact) => {
    toast({
      title: `Calling ${contact.name}`,
      description: `Connecting to ${contact.phoneNumber}...`,
      variant: contact.type === 'emergency' ? 'destructive' : 'default',
    });
    
    // Add pulse effect to the button that was clicked
    window.open(`tel:${contact.phoneNumber}`, '_self');
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageInput,
      timestamp: new Date().toISOString(),
      encrypted: true,
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessageInput("");
    
    toast({
      title: "Message Sent",
      description: "Your secure message has been delivered",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const priorityContacts = emergencyContacts?.slice(0, 4) || [
    { id: 1, name: 'Emergency Services', type: 'emergency', phoneNumber: '112', priority: 1 },
    { id: 2, name: 'Army Helpline', type: 'army', phoneNumber: '1800-XXX-XXXX', priority: 2 },
    { id: 3, name: 'Local Police', type: 'police', phoneNumber: '102', priority: 3 },
    { id: 4, name: 'Medical Emergency', type: 'medical', phoneNumber: '108', priority: 4 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Communication</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Secure channels for emergency coordination
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Emergency Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {priorityContacts.map((contact) => {
            const Icon = getContactIcon(contact.type);
            const colorClass = getContactColor(contact.type);
            
            return (
              <Button
                key={contact.id}
                onClick={() => handleCall(contact)}
                className={`p-4 ${colorClass} text-white rounded-lg text-center transition-all duration-200 group h-auto flex-col space-y-2`}
              >
                <Icon className="text-2xl group-hover:animate-pulse" size={24} />
                <div className="font-semibold text-sm">{contact.name}</div>
                <div className="text-xs opacity-90">{contact.phoneNumber}</div>
              </Button>
            );
          })}
        </div>
        
        {/* Secure Messaging Interface */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Secure Communication</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-safe-green rounded-full animate-pulse"></div>
              <Badge variant="outline" className="text-xs">
                <Lock size={10} className="mr-1" />
                End-to-end encrypted
              </Badge>
            </div>
          </div>
          
          {/* Messages */}
          <div className="space-y-3 max-h-40 overflow-y-auto mb-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No messages yet. Send a message to start communication.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.sender !== 'user' && (
                    <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                      {message.sender === 'control' ? (
                        <Shield className="text-white" size={12} />
                      ) : (
                        <User className="text-white" size={12} />
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      message.sender === 'user'
                        ? 'bg-saffron text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className={`text-xs mb-1 ${
                      message.sender === 'user' 
                        ? 'text-white opacity-75' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.sender === 'user' ? 'You' : 
                       message.sender === 'control' ? 'Control Room' : 'System'} • {formatTime(message.timestamp)}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    {message.encrypted && (
                      <div className={`flex items-center mt-1 text-xs ${
                        message.sender === 'user' 
                          ? 'text-white opacity-60' 
                          : 'text-gray-400'
                      }`}>
                        <Lock size={8} className="mr-1" />
                        Encrypted
                      </div>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-saffron rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-white" size={12} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Message Input */}
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type secure message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              className="bg-saffron hover:bg-orange-600 text-white"
              size="icon"
            >
              <Send size={16} />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Lock size={10} className="mr-1" />
            All messages are encrypted and secure
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
