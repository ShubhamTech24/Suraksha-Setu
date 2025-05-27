import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, User, MessageSquare, Send, Lock } from "lucide-react";

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
  const [messages] = useState([
    {
      id: '1',
      sender: 'Control Room',
      content: 'All sectors report normal. Maintain vigilance.',
      timestamp: '00:55',
      encrypted: true
    }
  ]);

  const handleCall = (contact: typeof emergencyContacts[0]) => {
    // In a real app, this would initiate a call
    window.open(`tel:${contact.number}`);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle message sending logic here
      setMessageInput("");
    }
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
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Lock className="h-3 w-3 mr-1" />
              End-to-end encrypted
            </Badge>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {message.encrypted && (
                      <Lock className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Sector 7, all clear. No unusual activity..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}