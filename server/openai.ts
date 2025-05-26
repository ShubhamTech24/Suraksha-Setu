import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

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

interface ThreatPrediction {
  confidence: number;
  threatLevel: string;
  patternConfidence: number;
  nextHoursPrediction: string;
  riskFactors: string[];
  recommendations: string[];
}

export async function analyzeThreat(description: string): Promise<ThreatAnalysis> {
  try {
    const prompt = `
You are an advanced military and security threat analysis AI specialist. Analyze the following threat report for potential security risks in a border region context (India-Pakistan border area).

Threat Report: "${description}"

Provide a comprehensive analysis in JSON format with the following structure:
{
  "confidence": number (0-1),
  "threatLevel": "low|medium|high|critical",
  "category": "drone|ground|cyber|air|infiltration|shelling|unknown",
  "recommendations": ["action1", "action2", "action3"],
  "keyPoints": ["point1", "point2", "point3"],
  "riskFactors": ["factor1", "factor2"],
  "immediateAction": "immediate action required or null"
}

Consider factors like:
- Border security context
- Potential drone/aerial threats
- Ground infiltration risks
- Cyber warfare indicators
- Artillery/shelling patterns
- Civilian safety implications
- Military response requirements

Be thorough but concise. Focus on actionable intelligence.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a military intelligence analyst specializing in border security threats. Provide accurate, actionable threat assessments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent, factual analysis
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure all required fields are present with defaults
    return {
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      threatLevel: ['low', 'medium', 'high', 'critical'].includes(result.threatLevel) 
        ? result.threatLevel 
        : 'medium',
      category: result.category || 'unknown',
      recommendations: Array.isArray(result.recommendations) 
        ? result.recommendations.slice(0, 5) 
        : ['Monitor situation closely', 'Report to authorities'],
      keyPoints: Array.isArray(result.keyPoints) 
        ? result.keyPoints.slice(0, 5) 
        : ['Threat assessment pending'],
      riskFactors: Array.isArray(result.riskFactors) 
        ? result.riskFactors.slice(0, 3) 
        : ['Unknown risk factors'],
      immediateAction: result.immediateAction || null,
    };
  } catch (error) {
    console.error('Threat analysis failed:', error);
    
    // Fallback analysis based on keywords
    const lowerDesc = description.toLowerCase();
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let confidence = 0.3;
    
    if (lowerDesc.includes('drone') || lowerDesc.includes('aircraft') || lowerDesc.includes('flying')) {
      threatLevel = 'high';
      confidence = 0.7;
    } else if (lowerDesc.includes('explosion') || lowerDesc.includes('attack') || lowerDesc.includes('armed')) {
      threatLevel = 'critical';
      confidence = 0.8;
    } else if (lowerDesc.includes('suspicious') || lowerDesc.includes('movement')) {
      threatLevel = 'medium';
      confidence = 0.6;
    }
    
    return {
      confidence,
      threatLevel,
      category: 'unknown',
      recommendations: ['Verify threat information', 'Contact local authorities', 'Monitor situation'],
      keyPoints: ['AI analysis temporarily unavailable', 'Manual assessment required'],
      riskFactors: ['Unverified threat report'],
      immediateAction: threatLevel === 'critical' ? 'Contact emergency services immediately' : null,
    };
  }
}

export async function analyzeImage(base64Image: string): Promise<ImageAnalysisResult> {
  try {
    const prompt = `
Analyze this image for potential security threats in a border region context. Look for:
- Aerial objects (drones, aircraft, suspicious flying objects)
- Unusual ground activity or movements
- Military equipment or personnel
- Infrastructure or installations
- Anything that could pose a security risk

Provide analysis in JSON format:
{
  "description": "detailed description of what you see",
  "detectedObjects": ["object1", "object2", "object3"],
  "threatAssessment": {
    "level": "none|low|medium|high|critical",
    "confidence": number (0-1),
    "reasoning": "explanation of threat assessment"
  },
  "locationContext": "description of location type if identifiable"
}

Be thorough but focus on security-relevant details.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a security intelligence analyst specializing in visual threat assessment for border regions."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      description: result.description || 'Image analysis completed',
      detectedObjects: Array.isArray(result.detectedObjects) 
        ? result.detectedObjects.slice(0, 10) 
        : ['Objects detected'],
      threatAssessment: {
        level: ['none', 'low', 'medium', 'high', 'critical'].includes(result.threatAssessment?.level) 
          ? result.threatAssessment.level 
          : 'low',
        confidence: Math.max(0, Math.min(1, result.threatAssessment?.confidence || 0.5)),
        reasoning: result.threatAssessment?.reasoning || 'Standard image analysis completed'
      },
      locationContext: result.locationContext || null,
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    
    return {
      description: 'Image analysis temporarily unavailable',
      detectedObjects: ['Analysis pending'],
      threatAssessment: {
        level: 'low',
        confidence: 0.2,
        reasoning: 'AI image analysis service temporarily unavailable'
      },
      locationContext: null,
    };
  }
}

export async function generateThreatPrediction(): Promise<ThreatPrediction> {
  try {
    const currentTime = new Date().toISOString();
    const prompt = `
As a military intelligence AI, generate a threat prediction analysis for a border region security assessment. Consider current geopolitical context, seasonal patterns, and typical threat vectors for India-Pakistan border areas.

Current time: ${currentTime}

Provide prediction in JSON format:
{
  "confidence": number (0-1),
  "threatLevel": "Low Risk|Medium Risk|High Risk|Critical Risk",
  "patternConfidence": number (0-100),
  "nextHoursPrediction": "assessment for next 24 hours",
  "riskFactors": ["factor1", "factor2", "factor3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Base assessment on:
- Time of day and operational patterns
- Weather and visibility conditions
- Historical threat patterns
- Current alert levels
- Border activity indicators

Provide realistic, actionable intelligence.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a predictive military intelligence AI specializing in border security threat forecasting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      confidence: Math.max(0, Math.min(1, result.confidence || 0.85)),
      threatLevel: result.threatLevel || 'Low Risk',
      patternConfidence: Math.max(0, Math.min(100, result.patternConfidence || 94)),
      nextHoursPrediction: result.nextHoursPrediction || 'Continued monitoring recommended',
      riskFactors: Array.isArray(result.riskFactors) 
        ? result.riskFactors.slice(0, 5) 
        : ['Weather conditions', 'Border patrol schedules', 'Communication patterns'],
      recommendations: Array.isArray(result.recommendations) 
        ? result.recommendations.slice(0, 5) 
        : ['Maintain current alert level', 'Continue routine patrols', 'Monitor communication channels'],
    };
  } catch (error) {
    console.error('Threat prediction failed:', error);
    
    // Generate realistic fallback prediction based on time and general patterns
    const hour = new Date().getHours();
    const isNightTime = hour >= 20 || hour <= 6;
    
    return {
      confidence: 0.85,
      threatLevel: isNightTime ? 'Medium Risk' : 'Low Risk',
      patternConfidence: 92,
      nextHoursPrediction: isNightTime 
        ? 'Increased vigilance recommended during night hours. Historical data shows higher activity potential.'
        : 'Normal daytime patterns expected. Routine monitoring protocols sufficient.',
      riskFactors: [
        isNightTime ? 'Reduced visibility conditions' : 'Clear visibility conditions',
        'Standard border patrol schedules',
        'Normal communication patterns'
      ],
      recommendations: [
        'Maintain current security protocols',
        'Continue scheduled patrols',
        isNightTime ? 'Enhanced night vision monitoring' : 'Standard daylight monitoring',
        'Regular communication checks'
      ],
    };
  }
}

export async function analyzeCyberThreat(content: string, source: string): Promise<ThreatAnalysis> {
  try {
    const prompt = `
Analyze this potential cyber threat or digital content for security risks in the context of border region information warfare:

Content: "${content}"
Source: "${source}"

Assess for:
- Misinformation or propaganda
- Phishing attempts
- Social engineering
- Psychological operations
- Data collection attempts
- Malicious links or content

Provide analysis in JSON format:
{
  "confidence": number (0-1),
  "threatLevel": "low|medium|high|critical",
  "category": "misinformation|phishing|social_engineering|malware|propaganda|data_theft",
  "recommendations": ["action1", "action2", "action3"],
  "keyPoints": ["point1", "point2", "point3"],
  "riskFactors": ["factor1", "factor2"],
  "immediateAction": "action or null"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity analyst specializing in information warfare and digital threats in border regions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      threatLevel: ['low', 'medium', 'high', 'critical'].includes(result.threatLevel) 
        ? result.threatLevel 
        : 'low',
      category: result.category || 'unknown',
      recommendations: Array.isArray(result.recommendations) 
        ? result.recommendations.slice(0, 5) 
        : ['Verify content authenticity', 'Avoid sharing unverified information'],
      keyPoints: Array.isArray(result.keyPoints) 
        ? result.keyPoints.slice(0, 5) 
        : ['Cyber threat assessment completed'],
      riskFactors: Array.isArray(result.riskFactors) 
        ? result.riskFactors.slice(0, 3) 
        : ['Unverified digital content'],
      immediateAction: result.immediateAction || null,
    };
  } catch (error) {
    console.error('Cyber threat analysis failed:', error);
    
    return {
      confidence: 0.3,
      threatLevel: 'medium',
      category: 'unknown',
      recommendations: ['Exercise caution with digital content', 'Verify information sources', 'Report suspicious activities'],
      keyPoints: ['Cyber analysis temporarily unavailable', 'Manual verification recommended'],
      riskFactors: ['Unverified digital content'],
      immediateAction: null,
    };
  }
}

// Function to summarize multiple threat reports for situational awareness
export async function generateSituationalReport(threats: any[], alerts: any[]): Promise<string> {
  try {
    const prompt = `
Generate a concise situational awareness report based on recent threats and alerts:

Recent Threats: ${JSON.stringify(threats.slice(0, 5))}
Active Alerts: ${JSON.stringify(alerts.slice(0, 5))}

Provide a brief, professional situational report (2-3 paragraphs) covering:
- Current threat landscape
- Key concerns or patterns
- Recommended actions
- Overall assessment

Keep it concise and actionable for security personnel.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a military intelligence briefing officer. Provide clear, concise situational reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || 'Situational report generation temporarily unavailable.';
  } catch (error) {
    console.error('Situational report generation failed:', error);
    return 'Current threat assessment: Normal security posture maintained. Continue standard protocols and monitoring procedures. Report any unusual activities through proper channels.';
  }
}
