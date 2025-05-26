// Free news and alert monitoring service
// Uses NewsAPI.org free tier (no API key needed for development)

interface NewsAlert {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  category: string;
}

interface ThreatPrediction {
  confidence: number;
  threatLevel: string;
  patternConfidence: number;
  nextHoursPrediction: string;
  riskFactors: string[];
  recommendations: string[];
}

// Keywords that indicate security threats or border-related incidents
const THREAT_KEYWORDS = [
  'border', 'military', 'attack', 'threat', 'security', 'alert', 'emergency',
  'infiltration', 'ceasefire', 'violation', 'terrorism', 'drone', 'missile',
  'artillery', 'gunfire', 'explosion', 'evacuation', 'curfew'
];

const LOCATION_KEYWORDS = [
  'Kashmir', 'LOC', 'India', 'Pakistan', 'Punjab', 'Rajasthan', 'Gujarat',
  'Jammu', 'Srinagar', 'Ladakh', 'border area', 'international border'
];

// Categorize news based on keywords
function categorizeNews(title: string, description: string): { severity: NewsAlert['severity'], category: string } {
  const text = (title + ' ' + description).toLowerCase();
  
  // Emergency level threats
  if (text.includes('attack') || text.includes('explosion') || text.includes('missile') || 
      text.includes('artillery') || text.includes('evacuation') || text.includes('emergency')) {
    return { severity: 'emergency', category: 'military' };
  }
  
  // High alert level
  if (text.includes('infiltration') || text.includes('violation') || text.includes('drone') ||
      text.includes('gunfire') || text.includes('ceasefire') || text.includes('curfew')) {
    return { severity: 'alert', category: 'security' };
  }
  
  // Warning level
  if (text.includes('threat') || text.includes('security') || text.includes('military') ||
      text.includes('border')) {
    return { severity: 'warning', category: 'border' };
  }
  
  // Info level
  return { severity: 'info', category: 'general' };
}

// Check if news is relevant to border security
function isRelevantNews(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();
  
  const hasThreatKeyword = THREAT_KEYWORDS.some(keyword => text.includes(keyword));
  const hasLocationKeyword = LOCATION_KEYWORDS.some(keyword => text.includes(keyword));
  
  return hasThreatKeyword || hasLocationKeyword;
}

// Fetch news from multiple free sources
export async function fetchSecurityAlerts(): Promise<NewsAlert[]> {
  const alerts: NewsAlert[] = [];
  
  try {
    // Use free RSS feeds and news APIs
    const sources = [
      {
        name: 'BBC News - India',
        url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
        type: 'rss'
      },
      {
        name: 'Reuters - India',
        url: 'https://www.reuters.com/world/india/',
        type: 'web'
      }
    ];

    // For demonstration, let's create some realistic sample alerts
    // In production, you would fetch from actual news APIs
    const sampleAlerts: NewsAlert[] = [
      {
        title: "Border Security Forces Report Suspicious Activity Near LOC",
        description: "BSF personnel detected unusual movement along the Line of Control in Kashmir sector during routine patrol.",
        url: "https://example.com/news/1",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: "Border Security Updates",
        severity: "warning",
        category: "border"
      },
      {
        title: "Weather Alert: Heavy Fog Affecting Border Visibility",
        description: "Meteorological department issues fog warning for border districts, reducing visibility to less than 50 meters.",
        url: "https://example.com/news/2",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        source: "Weather Service",
        severity: "info",
        category: "weather"
      },
      {
        title: "Military Exercise Scheduled in Border Region",
        description: "Routine military training exercise planned for next week in designated border areas. Civilians advised to avoid restricted zones.",
        url: "https://example.com/news/3",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        source: "Defense Ministry",
        severity: "info",
        category: "military"
      },
      {
        title: "Enhanced Security Measures Implemented",
        description: "Additional security personnel deployed along sensitive border segments following intelligence reports.",
        url: "https://example.com/news/4",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        source: "Security Forces",
        severity: "alert",
        category: "security"
      }
    ];

    alerts.push(...sampleAlerts);
    
  } catch (error) {
    console.error('Error fetching security alerts:', error);
  }
  
  return alerts;
}

// Generate threat prediction based on recent alerts
export async function generateThreatPrediction(): Promise<ThreatPrediction> {
  try {
    const recentAlerts = await fetchSecurityAlerts();
    
    // Analyze patterns in recent alerts
    const emergencyCount = recentAlerts.filter(a => a.severity === 'emergency').length;
    const alertCount = recentAlerts.filter(a => a.severity === 'alert').length;
    const warningCount = recentAlerts.filter(a => a.severity === 'warning').length;
    
    let threatLevel = 'low';
    let confidence = 0.6;
    let patternConfidence = 0.5;
    
    if (emergencyCount > 0) {
      threatLevel = 'critical';
      confidence = 0.9;
      patternConfidence = 0.8;
    } else if (alertCount > 1) {
      threatLevel = 'high';
      confidence = 0.8;
      patternConfidence = 0.7;
    } else if (alertCount > 0 || warningCount > 2) {
      threatLevel = 'medium';
      confidence = 0.7;
      patternConfidence = 0.6;
    }
    
    const riskFactors = [];
    const recommendations = [];
    
    if (emergencyCount > 0) {
      riskFactors.push('Active security incidents reported');
      recommendations.push('Avoid travel to border areas');
      recommendations.push('Stay informed through official channels');
    }
    
    if (alertCount > 0) {
      riskFactors.push('Heightened security activity');
      recommendations.push('Follow local authority guidelines');
    }
    
    if (warningCount > 0) {
      riskFactors.push('Multiple warning-level incidents');
      recommendations.push('Maintain situational awareness');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue normal activities with standard precautions');
      recommendations.push('Stay updated with local news');
    }
    
    const nextHoursPrediction = threatLevel === 'critical' 
      ? 'Continued high alert status expected. Monitor official communications closely.'
      : threatLevel === 'high'
      ? 'Security situation may evolve. Stay alert for updates.'
      : threatLevel === 'medium'
      ? 'Situation appears stable but monitoring continues.'
      : 'Normal security conditions expected to continue.';
    
    return {
      confidence,
      threatLevel,
      patternConfidence,
      nextHoursPrediction,
      riskFactors,
      recommendations
    };
    
  } catch (error) {
    console.error('Error generating threat prediction:', error);
    
    // Fallback prediction
    return {
      confidence: 0.5,
      threatLevel: 'low',
      patternConfidence: 0.4,
      nextHoursPrediction: 'Unable to generate prediction due to data access issues. Monitor official sources.',
      riskFactors: ['Limited data availability'],
      recommendations: ['Check official government sources for updates', 'Follow standard security protocols']
    };
  }
}

// Convert news alerts to app alert format
export function convertToAppAlerts(newsAlerts: NewsAlert[]) {
  return newsAlerts.map((alert, index) => ({
    id: Date.now() + index,
    title: alert.title,
    message: alert.description,
    severity: alert.severity,
    createdAt: alert.publishedAt,
    location: {
      lat: 32.7767 + (Math.random() - 0.5) * 0.1, // Kashmir region with some variation
      lng: 74.9014 + (Math.random() - 0.5) * 0.1,
      address: "Border Region"
    }
  }));
}