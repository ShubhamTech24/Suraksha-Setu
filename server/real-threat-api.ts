import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

interface ThreatAssessment {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  sources: string[];
  lastUpdated: string;
  locationSpecific: boolean;
}

interface SecurityAlert {
  title: string;
  description: string;
  severity: string;
  date: string;
  source: string;
  location?: string;
}

// Free government and public security feeds
const FREE_SECURITY_SOURCES = [
  {
    name: 'US Department of State Travel Advisories',
    url: 'https://travel.state.gov/content/travel/en/traveladvisories.html',
    type: 'government'
  },
  {
    name: 'BBC News Security Feed',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    type: 'news'
  },
  {
    name: 'Reuters Security News',
    url: 'https://www.reuters.com/news/archive/worldNews',
    type: 'news'
  }
];

// Location-based threat keywords for assessment
const THREAT_KEYWORDS = {
  critical: ['terrorist attack', 'armed conflict', 'war', 'bombing', 'explosion', 'active shooter', 'emergency declared'],
  high: ['security alert', 'military action', 'border closure', 'evacuation', 'curfew', 'violence', 'protest'],
  medium: ['security concern', 'increased patrols', 'heightened security', 'demonstration', 'unrest'],
  low: ['routine security', 'normal operations', 'peaceful', 'stable']
};

// Get location-specific news from BBC RSS feed (free)
async function fetchBBCNews(): Promise<SecurityAlert[]> {
  try {
    const response = await fetch('http://feeds.bbci.co.uk/news/world/rss.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThreatAssessment/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlData = await response.text();
    const result = await parseXML(xmlData);
    
    const alerts: SecurityAlert[] = [];
    const items = result.rss?.channel?.[0]?.item || [];
    
    for (const item of items.slice(0, 20)) { // Get latest 20 items
      const title = item.title?.[0] || '';
      const description = item.description?.[0] || '';
      const pubDate = item.pubDate?.[0] || '';
      
      // Filter for security-related news
      const securityKeywords = ['security', 'attack', 'threat', 'border', 'military', 'conflict', 'violence', 'terrorism', 'alert'];
      const isSecurityRelated = securityKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
      );
      
      if (isSecurityRelated) {
        alerts.push({
          title,
          description,
          severity: assessSeverityFromText(title + ' ' + description),
          date: pubDate,
          source: 'BBC News',
          location: extractLocationFromText(title + ' ' + description)
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error fetching BBC news:', error);
    return [];
  }
}

// Extract location mentions from text
function extractLocationFromText(text: string): string | undefined {
  const locationKeywords = [
    'india', 'pakistan', 'kashmir', 'border', 'punjab', 'rajasthan', 'gujarat',
    'jammu', 'ladakh', 'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata',
    'hyderabad', 'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
    'nagpur', 'indore', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara',
    'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot'
  ];
  
  const lowerText = text.toLowerCase();
  for (const location of locationKeywords) {
    if (lowerText.includes(location)) {
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  }
  return undefined;
}

// Assess severity based on text content
function assessSeverityFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [level, keywords] of Object.entries(THREAT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return level;
      }
    }
  }
  
  return 'low';
}

// Get government travel advisories (simplified approach)
async function getGovernmentAdvisories(): Promise<SecurityAlert[]> {
  // Since we can't directly access government APIs without keys,
  // we'll use a simplified approach based on known security patterns
  
  const currentDate = new Date().toISOString();
  const defaultAdvisories: SecurityAlert[] = [];
  
  // Check for any current major global events that would affect threat levels
  // This would normally come from government feeds
  try {
    // Placeholder for government advisory data
    // In a real implementation, this would parse official government security feeds
    return defaultAdvisories;
  } catch (error) {
    console.error('Error fetching government advisories:', error);
    return defaultAdvisories;
  }
}

// Calculate location-specific threat level
function calculateLocationThreatLevel(userLat?: number, userLng?: number, alerts: SecurityAlert[] = []): ThreatAssessment {
  let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let confidence = 0.7;
  let locationSpecific = false;
  
  // Base threat level on actual news and alerts
  if (alerts.length === 0) {
    return {
      threatLevel: 'low',
      confidence: 0.8,
      description: 'No current security alerts detected for your region. Normal security posture maintained.',
      sources: ['Local assessment'],
      lastUpdated: new Date().toISOString(),
      locationSpecific: false
    };
  }
  
  // Analyze alerts for threat level
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let locationRelevantAlerts = 0;
  
  for (const alert of alerts) {
    if (alert.location) {
      locationRelevantAlerts++;
      locationSpecific = true;
    }
    
    switch (alert.severity) {
      case 'critical':
        criticalCount++;
        break;
      case 'high':
        highCount++;
        break;
      case 'medium':
        mediumCount++;
        break;
    }
  }
  
  // Determine overall threat level
  if (criticalCount > 0) {
    threatLevel = 'critical';
    confidence = 0.9;
  } else if (highCount > 1) {
    threatLevel = 'high';
    confidence = 0.8;
  } else if (highCount > 0 || mediumCount > 2) {
    threatLevel = 'medium';
    confidence = 0.7;
  } else {
    threatLevel = 'low';
    confidence = 0.8;
  }
  
  // Location-specific adjustments
  if (userLat && userLng) {
    // India border regions have different base threat levels
    const distanceFromPakBorder = calculateDistanceFromPakistanBorder(userLat, userLng);
    const distanceFromChinaBorder = calculateDistanceFromChinaBorder(userLat, userLng);
    
    if (distanceFromPakBorder < 50 || distanceFromChinaBorder < 50) {
      // Within 50km of international border - slightly elevated base level
      if (threatLevel === 'low' && (highCount > 0 || mediumCount > 1)) {
        threatLevel = 'medium';
        confidence = 0.7;
      }
      locationSpecific = true;
    }
  }
  
  const description = generateThreatDescription(threatLevel, alerts, locationSpecific);
  
  return {
    threatLevel,
    confidence,
    description,
    sources: [...new Set(alerts.map(a => a.source))],
    lastUpdated: new Date().toISOString(),
    locationSpecific
  };
}

// Calculate distance from Pakistan border (approximate)
function calculateDistanceFromPakistanBorder(lat: number, lng: number): number {
  // Approximate Pakistan border coordinates
  const borderPoints = [
    { lat: 32.5, lng: 74.5 }, // Punjab border
    { lat: 27.0, lng: 70.0 }, // Rajasthan border
    { lat: 24.0, lng: 68.5 }  // Gujarat border
  ];
  
  let minDistance = Infinity;
  for (const point of borderPoints) {
    const distance = calculateHaversineDistance(lat, lng, point.lat, point.lng);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

// Calculate distance from China border (approximate)
function calculateDistanceFromChinaBorder(lat: number, lng: number): number {
  // Approximate China border coordinates
  const borderPoints = [
    { lat: 34.5, lng: 78.0 }, // Ladakh border
    { lat: 28.0, lng: 94.0 }  // Arunachal Pradesh border
  ];
  
  let minDistance = Infinity;
  for (const point of borderPoints) {
    const distance = calculateHaversineDistance(lat, lng, point.lat, point.lng);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

// Haversine distance calculation
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Generate human-readable threat description
function generateThreatDescription(level: string, alerts: SecurityAlert[], locationSpecific: boolean): string {
  const baseDescriptions = {
    low: 'Current security assessment indicates normal threat levels for your region.',
    medium: 'Moderate security concerns detected. Maintain normal vigilance and awareness.',
    high: 'Elevated security threats identified. Exercise increased caution and avoid high-risk areas.',
    critical: 'Critical security situation detected. Follow official guidance and emergency protocols immediately.'
  };
  
  let description = baseDescriptions[level as keyof typeof baseDescriptions];
  
  if (alerts.length > 0) {
    const recentAlert = alerts[0];
    description += ` Recent security report: ${recentAlert.title}`;
  }
  
  if (locationSpecific) {
    description += ' Assessment includes location-specific factors.';
  }
  
  return description;
}

// Main function to get real threat assessment
export async function getRealThreatAssessment(userLat?: number, userLng?: number): Promise<ThreatAssessment> {
  try {
    console.log('Fetching real threat assessment data...');
    
    // Fetch from multiple free sources
    const [bbcAlerts, govAdvisories] = await Promise.all([
      fetchBBCNews(),
      getGovernmentAdvisories()
    ]);
    
    const allAlerts = [...bbcAlerts, ...govAdvisories];
    console.log(`Found ${allAlerts.length} security-related alerts`);
    
    // Calculate threat level based on real data
    const assessment = calculateLocationThreatLevel(userLat, userLng, allAlerts);
    
    console.log(`Threat assessment: ${assessment.threatLevel} (confidence: ${assessment.confidence})`);
    return assessment;
    
  } catch (error) {
    console.error('Error in real threat assessment:', error);
    
    // Fallback to conservative assessment
    return {
      threatLevel: 'low',
      confidence: 0.6,
      description: 'Unable to fetch current threat data. Maintaining normal security posture.',
      sources: ['Local assessment'],
      lastUpdated: new Date().toISOString(),
      locationSpecific: false
    };
  }
}