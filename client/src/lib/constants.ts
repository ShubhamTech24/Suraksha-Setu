export const THREAT_TYPES = {
  DRONE: 'drone',
  CYBER: 'cyber',
  GROUND: 'ground',
  AIR: 'air',
  INFILTRATION: 'infiltration',
  SHELLING: 'shelling',
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ALERT: 'alert',
  EMERGENCY: 'emergency',
} as const;

export const SAFE_ZONE_TYPES = {
  BUNKER: 'bunker',
  HOSPITAL: 'hospital',
  MILITARY_POST: 'military_post',
  EVACUATION_CENTER: 'evacuation_center',
} as const;

export const EDUCATION_CATEGORIES = {
  DRONE_RESPONSE: 'drone_response',
  EVACUATION: 'evacuation',
  CYBER_SAFETY: 'cyber_safety',
  FIRST_AID: 'first_aid',
  PREPAREDNESS: 'preparedness',
} as const;

export const EMERGENCY_CONTACT_TYPES = {
  EMERGENCY: 'emergency',
  ARMY: 'army',
  POLICE: 'police',
  MEDICAL: 'medical',
  LOCAL: 'local',
} as const;

export const COLORS = {
  SAFFRON: 'hsl(24, 96%, 59%)',
  INDIAN_GREEN: 'hsl(120, 83%, 28%)',
  NAVY: 'hsl(240, 100%, 25%)',
  ALERT_RED: 'hsl(0, 73%, 50%)',
  WARNING_AMBER: 'hsl(43, 96%, 56%)',
  SAFE_GREEN: 'hsl(142, 71%, 45%)',
  AI_PURPLE: 'hsl(258, 90%, 66%)',
} as const;

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  PB: 'pb', // Punjabi
  UR: 'ur', // Urdu
} as const;

export const WEBSOCKET_MESSAGE_TYPES = {
  CONNECTION_ESTABLISHED: 'connection_established',
  NEW_ALERT: 'new_alert',
  THREAT_ALERT: 'threat_alert',
  URGENT_REPORT: 'urgent_report',
  SYSTEM_UPDATE: 'system_update',
} as const;

export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_LOCATION: 'user_location',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: [32.7767, 74.8723], // Kashmir region
  DEFAULT_ZOOM: 10,
  MAX_ZOOM: 18,
  MIN_ZOOM: 6,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov', 'video/avi'],
  MAX_FILES: 5,
} as const;

export const API_ENDPOINTS = {
  DASHBOARD_STATS: '/api/dashboard/stats',
  ALERTS: '/api/alerts',
  THREATS: '/api/threats',
  REPORTS: '/api/reports',
  SAFE_ZONES: '/api/safe-zones',
  EDUCATION: '/api/education',
  EMERGENCY_CONTACTS: '/api/emergency-contacts',
  AI_PREDICTION: '/api/ai/threat-prediction',
  HEALTH: '/api/health',
} as const;
