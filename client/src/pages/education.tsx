import { useState } from "react";
import { Header } from "@/components/header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Video, Brain, Heart, ChevronRight, GraduationCap, 
  Search, Filter, BookOpen, Play, Clock, Star, Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";

interface EducationResource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'guide';
  category: 'drone_response' | 'evacuation' | 'cyber_safety' | 'first_aid' | 'preparedness';
  content?: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high' | 'essential';
}

export default function Education() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<EducationResource | null>(null);

  const { data: resources, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.EDUCATION, categoryFilter !== "all" ? categoryFilter : undefined],
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
        return BookOpen;
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'drone_response':
        return {
          color: 'bg-indian-green',
          label: 'Drone Response',
          description: 'How to respond to drone threats',
        };
      case 'evacuation':
        return {
          color: 'bg-navy',
          label: 'Evacuation',
          description: 'Emergency evacuation procedures',
        };
      case 'cyber_safety':
        return {
          color: 'bg-ai-purple',
          label: 'Cyber Safety',
          description: 'Digital security and awareness',
        };
      case 'first_aid':
        return {
          color: 'bg-warning-amber',
          label: 'First Aid',
          description: 'Medical emergency response',
        };
      case 'preparedness':
        return {
          color: 'bg-safe-green',
          label: 'Preparedness',
          description: 'General emergency preparedness',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'General',
          description: 'General safety information',
        };
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

  const filteredResources = resources?.filter((resource: EducationResource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const categories = [
    { value: 'drone_response', label: 'Drone Response' },
    { value: 'evacuation', label: 'Evacuation' },
    { value: 'cyber_safety', label: 'Cyber Safety' },
    { value: 'first_aid', label: 'First Aid' },
    { value: 'preparedness', label: 'Preparedness' },
  ];

  const featuredResources = filteredResources.filter((r: EducationResource) => r.priority === 'essential');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Safety Education Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn essential safety skills and emergency preparedness techniques
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const config = getCategoryConfig(category.value);
            const count = resources?.filter((r: EducationResource) => r.category === category.value).length || 0;
            
            return (
              <Card key={category.value} className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => setCategoryFilter(category.value)}>
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 ${config.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                    <Shield className="text-white" size={20} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{config.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-saffron to-indian-green text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="text-white" size={20} />
                <span>Essential Training</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredResources.slice(0, 2).map((resource: EducationResource) => {
                  const Icon = getResourceIcon(resource.type);
                  
                  return (
                    <div key={resource.id} 
                         className="p-4 bg-white bg-opacity-20 rounded-lg cursor-pointer hover:bg-opacity-30 transition-all"
                         onClick={() => setSelectedResource(resource)}>
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Icon className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{resource.title}</h4>
                          <p className="text-sm opacity-90 mt-1">{resource.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="text-white" size={12} />
                            <span className="text-xs">{formatDuration(resource.duration, resource.type)}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-white" size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter size={20} />
              <span>Filter Resources</span>
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
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="guide">Guides</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Resources Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {resources?.length === 0 
                        ? "Educational resources will be added soon" 
                        : "No resources match your current filters"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredResources.map((resource: EducationResource) => {
                      const Icon = getResourceIcon(resource.type);
                      const categoryConfig = getCategoryConfig(resource.category);
                      
                      return (
                        <div
                          key={resource.id}
                          className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                          onClick={() => setSelectedResource(resource)}
                        >
                          <div className={`w-12 h-12 ${categoryConfig.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
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
                              <Badge variant="outline">{categoryConfig.label}</Badge>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400 group-hover:text-saffron transition-colors" size={20} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap size={20} />
                  <span>Quick Start</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">New to Safety Training?</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Start with our essential courses covering basic emergency preparedness.
                  </p>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => setCategoryFilter('preparedness')}
                >
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Download Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download size={20} />
                  <span>Download Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Download offline guides for emergency situations
                </div>
                
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download size={14} className="mr-2" />
                  Emergency Contact List
                </Button>
                
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download size={14} className="mr-2" />
                  Evacuation Procedures
                </Button>
                
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download size={14} className="mr-2" />
                  First Aid Checklist
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Courses Completed</span>
                    <span className="font-semibold">0/{resources?.length || 0}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-saffron h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Complete training courses to track your progress
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resource Viewer Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedResource.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDuration(selectedResource.duration, selectedResource.type)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedResource(null)}
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {selectedResource.type === 'video' ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Video content would be embedded here</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {selectedResource.description}
                    </p>
                    
                    {selectedResource.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedResource.content }} />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Content Coming Soon
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This educational resource is being prepared and will be available shortly.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <MobileNavigation />
    </div>
  );
}
