import { Shield, Video, Brain, Heart, ChevronRight, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface EducationResource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'guide';
  category: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high' | 'essential';
}

export function EducationCenter() {
  const { data: resources, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.EDUCATION],
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'interactive':
        return Brain;
      case 'guide':
        return Heart;
      default:
        return Shield;
    }
  };

  const getResourceColor = (category: string) => {
    switch (category) {
      case 'drone_response':
        return 'bg-indian-green';
      case 'evacuation':
        return 'bg-navy';
      case 'cyber_safety':
        return 'bg-ai-purple';
      case 'first_aid':
        return 'bg-warning-amber';
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Safety Education</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Essential knowledge for emergency preparedness
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safety Education</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Essential knowledge for emergency preparedness
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {!resources || resources.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Resources Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Educational resources will be added soon
              </p>
            </div>
          ) : (
            resources.slice(0, 4).map((resource: EducationResource) => {
              const Icon = getResourceIcon(resource.type);
              const colorClass = getResourceColor(resource.category);
              
              return (
                <div
                  key={resource.id}
                  className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                >
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-saffron transition-colors">
                      {resource.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(resource.duration, resource.type)}
                      </span>
                      <Badge variant={getPriorityVariant(resource.priority)}>
                        {resource.priority.charAt(0).toUpperCase() + resource.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-saffron transition-colors" size={20} />
                </div>
              );
            })
          )}
        </div>
        
        {resources && resources.length > 0 && (
          <div className="mt-6 p-4 gradient-bg rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-semibold">Complete Safety Training</h4>
                <p className="text-sm opacity-90">Join our comprehensive safety program</p>
              </div>
            </div>
            <Button 
              className="mt-3 w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/20"
              variant="outline"
            >
              Start Training Program
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
