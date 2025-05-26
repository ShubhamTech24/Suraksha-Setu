// Simple threat analysis without external APIs
// Uses keyword-based analysis for immediate functionality

interface ThreatAnalysis {
  confidence: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendations: string[];
  keyPoints: string[];
  riskFactors: string[];
  immediateAction?: string;
}

interface ImageAnalysisResult {
  description: string;
  detectedObjects: string[];
  threatAssessment: {
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    reasoning: string;
  };
  locationContext?: string;
}

// Keywords for threat categorization
const THREAT_KEYWORDS = {
  critical: ['explosion', 'attack', 'bombing', 'terrorist', 'missile', 'artillery', 'gunfire', 'shooting'],
  high: ['infiltration', 'breach', 'armed', 'weapon', 'violation', 'hostile', 'threat', 'danger'],
  medium: ['suspicious', 'unusual', 'movement', 'activity', 'patrol', 'security', 'alert'],
  low: ['routine', 'normal', 'standard', 'regular', 'maintenance', 'training']
};

const CATEGORY_KEYWORDS = {
  drone: ['drone', 'uav', 'unmanned', 'aerial', 'flying', 'aircraft'],
  ground: ['vehicle', 'personnel', 'foot', 'patrol', 'movement', 'crossing'],
  cyber: ['network', 'system', 'computer', 'digital', 'electronic', 'communication'],
  air: ['aircraft', 'helicopter', 'plane', 'aviation', 'airspace'],
  infiltration: ['border', 'crossing', 'breach', 'entry', 'infiltration'],
  shelling: ['artillery', 'mortar', 'shell', 'bombardment', 'explosion']
};

export function analyzeThreat(description: string): ThreatAnalysis {
  const text = description.toLowerCase();
  
  // Determine threat level
  let threatLevel: ThreatAnalysis['threatLevel'] = 'low';
  let confidence = 0.6;
  
  if (THREAT_KEYWORDS.critical.some(keyword => text.includes(keyword))) {
    threatLevel = 'critical';
    confidence = 0.9;
  } else if (THREAT_KEYWORDS.high.some(keyword => text.includes(keyword))) {
    threatLevel = 'high';
    confidence = 0.8;
  } else if (THREAT_KEYWORDS.medium.some(keyword => text.includes(keyword))) {
    threatLevel = 'medium';
    confidence = 0.7;
  }
  
  // Determine category
  let category = 'unknown';
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Generate recommendations based on threat level
  const recommendations = [];
  const riskFactors = [];
  const keyPoints = [];
  let immediateAction;
  
  switch (threatLevel) {
    case 'critical':
      recommendations.push('Immediate evacuation of area', 'Contact emergency services', 'Activate security protocols');
      riskFactors.push('High risk to civilian safety', 'Potential for escalation');
      keyPoints.push('Critical security incident reported', 'Immediate response required');
      immediateAction = 'EVACUATE AREA IMMEDIATELY';
      break;
    case 'high':
      recommendations.push('Increase security patrols', 'Monitor situation closely', 'Prepare contingency plans');
      riskFactors.push('Elevated security risk', 'Potential threat to operations');
      keyPoints.push('Significant security concern identified', 'Enhanced monitoring recommended');
      break;
    case 'medium':
      recommendations.push('Maintain heightened awareness', 'Continue routine patrols', 'Document observations');
      riskFactors.push('Moderate security risk', 'Requires monitoring');
      keyPoints.push('Security situation noted', 'Standard protocols apply');
      break;
    default:
      recommendations.push('Continue normal operations', 'Maintain standard security measures');
      riskFactors.push('Low security risk');
      keyPoints.push('Routine security report', 'No immediate concerns');
  }
  
  return {
    confidence,
    threatLevel,
    category,
    recommendations,
    keyPoints,
    riskFactors,
    immediateAction
  };
}

export function analyzeImage(base64Image: string): ImageAnalysisResult {
  // Simple analysis based on file properties and basic detection
  // In a real implementation, this would use computer vision APIs
  
  return {
    description: "Image analysis requires computer vision capabilities. Please provide detailed description of what you observe in the image.",
    detectedObjects: ["Unable to process image without vision API"],
    threatAssessment: {
      level: 'none',
      confidence: 0.1,
      reasoning: "Image analysis not available without computer vision API"
    },
    locationContext: "Manual review required"
  };
}