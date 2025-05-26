import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import { z } from "zod";

const reportFormSchema = insertReportSchema.extend({
  datetime: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export function ReportingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { latitude, longitude } = useGeolocation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      isAnonymous: false,
      urgencyLevel: "medium",
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'location' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add files
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      const response = await fetch(API_ENDPOINTS.REPORTS, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully and is being analyzed.",
      });
      reset();
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DASHBOARD_STATS] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportFormData) => {
    // Add current location if available
    if (latitude && longitude) {
      data.location = {
        lat: latitude,
        lng: longitude,
      };
    }

    submitReportMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast({
        title: "Too Many Files",
        description: "Maximum 5 files allowed",
        variant: "destructive",
      });
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Suspicious Activity</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Help protect your community by reporting unusual activities
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type of Activity
            </label>
            <Select onValueChange={(value) => setValue('threatType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drone">Aerial Object/Drone</SelectItem>
                <SelectItem value="ground">Suspicious Movement</SelectItem>
                <SelectItem value="sound">Unusual Sounds</SelectItem>
                <SelectItem value="cyber">Cyber Activity</SelectItem>
                <SelectItem value="infiltration">Infiltration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.threatType && (
              <p className="text-sm text-red-500 mt-1">{errors.threatType.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              {...register('description')}
              rows={3}
              placeholder="Describe what you observed..."
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time
              </label>
              <Input
                {...register('datetime')}
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level
              </label>
              <Select onValueChange={(value) => setValue('urgencyLevel', value)} defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* File upload area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Drop images or videos here, or{" "}
                    <span className="text-saffron hover:underline">browse</span>
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports JPG, PNG, MP4, MOV (Max 50MB)
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={watch('isAnonymous')}
              onCheckedChange={(checked) => setValue('isAnonymous', !!checked)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
              Submit anonymously
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-saffron hover:bg-orange-600 text-white"
            disabled={submitReportMutation.isPending}
          >
            {submitReportMutation.isPending ? (
              "Submitting..."
            ) : (
              <>
                <Layers className="mr-2" size={16} />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
