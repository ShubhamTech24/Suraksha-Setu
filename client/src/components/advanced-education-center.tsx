import { useState } from "react";
import { Shield, Video, Brain, Heart, ChevronRight, GraduationCap, Play, Clock, Eye, BookOpen, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface EducationResource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'guide';
  category: string;
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high' | 'essential';
}

const safetyEducationData = [
  {
    id: 1,
    title: "Emergency Evacuation Procedures",
    description: "Complete guide on how to safely evacuate during emergencies",
    type: "video",
    category: "evacuation",
    videoUrl: "https://www.youtube.com/embed/kFjjONGLzV4",
    thumbnailUrl: "https://img.youtube.com/vi/kFjjONGLzV4/maxresdefault.jpg",
    duration: 8,
    priority: "essential"
  },
  {
    id: 2,
    title: "First Aid Basics for Border Areas",
    description: "Essential first aid techniques for emergency situations",
    type: "video",
    category: "first_aid",
    videoUrl: "https://www.youtube.com/embed/7RRn9MmxCbw",
    thumbnailUrl: "https://img.youtube.com/vi/7RRn9MmxCbw/maxresdefault.jpg",
    duration: 12,
    priority: "essential"
  },
  {
    id: 3,
    title: "Cyber Security for Citizens",
    description: "Protect yourself from cyber threats and digital attacks",
    type: "video",
    category: "cyber_safety",
    videoUrl: "https://www.youtube.com/embed/inWWhr5tnEA",
    thumbnailUrl: "https://img.youtube.com/vi/inWWhr5tnEA/maxresdefault.jpg",
    duration: 15,
    priority: "high"
  },
  {
    id: 4,
    title: "Drone Threat Recognition",
    description: "Learn to identify and respond to drone-related security threats",
    type: "video",
    category: "drone_response",
    videoUrl: "https://www.youtube.com/embed/QrGc5eOkLww",
    thumbnailUrl: "https://img.youtube.com/vi/QrGc5eOkLww/maxresdefault.jpg",
    duration: 10,
    priority: "high"
  },
  {
    id: 5,
    title: "Building Emergency Kit",
    description: "Essential items every family should have for emergencies",
    type: "guide",
    category: "preparedness",
    content: "Emergency kit preparation guide with detailed checklist",
    duration: 5,
    priority: "medium"
  },
  {
    id: 6,
    title: "Communication During Crisis",
    description: "How to maintain communication during emergency situations",
    type: "article",
    category: "communication",
    content: "Complete guide on emergency communication protocols",
    duration: 7,
    priority: "high"
  }
];

export function AdvancedEducationCenter() {
  const [selectedResource, setSelectedResource] = useState<EducationResource | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // In a real app, this would fetch from API
  const { data: resources = safetyEducationData, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.EDUCATION],
    enabled: false, // Using local data for now
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'interactive':
        return Brain;
      case 'guide':
        return Heart;
      case 'article':
        return BookOpen;
      default:
        return Shield;
    }
  };

  const getResourceColor = (category: string) => {
    switch (category) {
      case 'drone_response':
        return 'bg-red-500';
      case 'evacuation':
        return 'bg-orange-500';
      case 'cyber_safety':
        return 'bg-purple-500';
      case 'first_aid':
        return 'bg-green-500';
      case 'preparedness':
        return 'bg-blue-500';
      case 'communication':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'essential':
        return 'destructive' as const;
      case 'high':
        return 'default' as const;
      case 'medium':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDuration = (duration?: number, type?: string) => {
    if (!duration) return '';
    if (type === 'video') return `${duration} min video`;
    return `${duration} min read`;
  };

  const categories = [
    { id: 'all', name: 'All Categories', count: (resources as EducationResource[]).length },
    { id: 'evacuation', name: 'Evacuation', count: (resources as EducationResource[]).filter(r => r.category === 'evacuation').length },
    { id: 'first_aid', name: 'First Aid', count: (resources as EducationResource[]).filter(r => r.category === 'first_aid').length },
    { id: 'cyber_safety', name: 'Cyber Safety', count: (resources as EducationResource[]).filter(r => r.category === 'cyber_safety').length },
    { id: 'drone_response', name: 'Drone Response', count: (resources as EducationResource[]).filter(r => r.category === 'drone_response').length },
    { id: 'preparedness', name: 'Preparedness', count: (resources as EducationResource[]).filter(r => r.category === 'preparedness').length },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? (resources as EducationResource[])
    : (resources as EducationResource[]).filter(r => r.category === selectedCategory);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Safety Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
              <Skeleton className="w-16 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Advanced Safety Education Center
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive safety training with video tutorials and interactive guides
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource: EducationResource) => {
                  const Icon = getResourceIcon(resource.type);
                  const colorClass = getResourceColor(resource.category);
                  
                  return (
                    <Dialog key={resource.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                          <CardContent className="p-4">
                            {resource.type === 'video' && resource.thumbnailUrl && (
                              <div className="relative mb-3 rounded-lg overflow-hidden">
                                <img 
                                  src={resource.thumbnailUrl} 
                                  alt={resource.title}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                                <Badge className="absolute top-2 right-2 bg-black bg-opacity-70 text-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {resource.duration}m
                                </Badge>
                              </div>
                            )}
                            
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className="text-white" size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {resource.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant={getPriorityVariant(resource.priority)} className="text-xs">
                                    {resource.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDuration(resource.duration, resource.type)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {resource.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {resource.type === 'video' && resource.videoUrl && (
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                src={resource.videoUrl}
                                title={resource.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              {resource.description}
                            </p>
                          </div>
                          
                          {resource.content && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Content</h3>
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {resource.content}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <Badge variant={getPriorityVariant(resource.priority)}>
                                {resource.priority} Priority
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDuration(resource.duration, resource.type)}
                              </span>
                            </div>
                            <Button>
                              <Eye className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Complete Safety Certification</h4>
                <p className="text-sm opacity-90">
                  Complete all essential courses to get your safety certification
                </p>
              </div>
              <Button 
                className="bg-white text-orange-600 hover:bg-gray-100"
                size="lg"
              >
                Start Program
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}