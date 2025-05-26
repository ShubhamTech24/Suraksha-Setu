export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface DashboardStats {
  activeThreats: number;
  pendingReports: number;
  safeZones: number;
  aiConfidence: number;
}

export interface ThreatAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: Location;
  status: 'active' | 'resolved' | 'investigating';
  confidence?: number;
  source: 'system' | 'user' | 'ai';
  createdAt: string;
  updatedAt: string;
}

export interface UserReport {
  id: number;
  threatType: string;
  description: string;
  location?: Location;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  media?: string[];
  isAnonymous: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'investigating';
  aiAnalysis?: any;
  createdAt: string;
}

export interface SafeZone {
  id: number;
  name: string;
  type: 'bunker' | 'hospital' | 'military_post' | 'evacuation_center';
  location: Location;
  capacity?: number;
  facilities?: string[];
  contact?: string;
  isActive: boolean;
  distance?: number; // Calculated distance from user
}

export interface Alert {
  id: number;
  threatId?: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  targetArea?: Location;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface EducationResource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'guide';
  category: 'drone_response' | 'evacuation' | 'cyber_safety' | 'first_aid' | 'preparedness';
  content?: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high' | 'essential';
}

export interface EmergencyContact {
  id: number;
  name: string;
  type: 'emergency' | 'army' | 'police' | 'medical' | 'local';
  phoneNumber: string;
  location?: string;
  priority: number;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

export interface AIAnalysis {
  confidence: number;
  threatLevel: string;
  recommendations: string[];
  keyPoints: string[];
}

export interface MapMarker {
  id: string;
  type: 'safe_zone' | 'threat' | 'user' | 'military' | 'hospital' | 'warning';
  position: Location;
  title: string;
  description?: string;
  severity?: string;
  icon: string;
  color: string;
}

export interface ReportFormData {
  threatType: string;
  description: string;
  urgencyLevel: string;
  location?: Location;
  media?: File[];
  isAnonymous: boolean;
  datetime?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface NotificationPreferences {
  emergencyAlerts: boolean;
  threatUpdates: boolean;
  safetyReminders: boolean;
  educationalContent: boolean;
  systemMaintenance: boolean;
}
