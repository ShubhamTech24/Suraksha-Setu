import { ChevronRight, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const educationModules = [
  {
    id: 1,
    title: "Cyber Safety for Civilians",
    description: "Protecting yourself from cyber threats during heightened tensions",
    duration: "10 min read",
    priority: "High",
    icon: "C",
    iconColor: "bg-purple-500",
    priorityColor: "bg-orange-500"
  },
  {
    id: 2,
    title: "Basic First Aid in Emergency", 
    description: "Life-saving first aid techniques for emergency situations",
    duration: "25 min video",
    priority: "High",
    icon: "F",
    iconColor: "bg-yellow-500",
    priorityColor: "bg-orange-500"
  },
  {
    id: 3,
    title: "Drone Response Protocol",
    description: "Complete guide on how to respond when drones are spotted in your area",
    duration: "15 min read",
    priority: "Essential",
    icon: "D",
    iconColor: "bg-green-500",
    priorityColor: "bg-red-500"
  },
  {
    id: 4,
    title: "Evacuation Routes & Procedures",
    description: "Essential information about evacuation routes and emergency procedures", 
    duration: "20 min read",
    priority: "Essential",
    icon: "E",
    iconColor: "bg-blue-500",
    priorityColor: "bg-red-500"
  }
];

export function DashboardSafetyEducation() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Safety Education
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Essential knowledge for emergency preparedness
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Education Modules */}
        <div className="space-y-3">
          {educationModules.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${module.iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-semibold text-sm">{module.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {module.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{module.duration}</span>
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${module.priorityColor} text-white border-0`}
                    >
                      {module.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </div>
          ))}
        </div>

        {/* Complete Safety Training Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">
                Complete Safety Training
              </h4>
              <p className="text-white text-opacity-90 text-xs">
                Join our comprehensive safety program
              </p>
            </div>
          </div>
          <Button 
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 text-sm font-medium"
          >
            Start Training Program
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}