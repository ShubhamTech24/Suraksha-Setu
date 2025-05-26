import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertReportSchema, insertThreatSchema, insertAlertSchema } from "@shared/schema";
import { generateThreatPrediction, fetchSecurityAlerts, convertToAppAlerts } from "./news-api";
import { analyzeThreat, analyzeImage } from "./simple-analysis";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// WebSocket connections storage
const wsConnections = new Set<WebSocket>();

// Store user locations for real-time tracking
const userLocations = new Map<string, {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  sessionId: string;
}>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    wsConnections.add(ws);
    
    ws.on('close', () => {
      wsConnections.delete(ws);
    });
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString()
    }));
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    wsConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [activeThreats, pendingReports, safeZones] = await Promise.all([
        storage.getActiveThreatCount(),
        storage.getPendingReportsCount(),
        storage.getSafeZones(),
      ]);

      // Generate AI confidence score
      const aiConfidence = await generateThreatPrediction();

      res.json({
        activeThreats,
        pendingReports,
        safeZones: safeZones.length,
        aiConfidence: aiConfidence.confidence || 97.3,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get real-time alerts (combines database alerts with news-based alerts)
  app.get("/api/alerts", async (req, res) => {
    try {
      const [dbAlerts, newsAlerts] = await Promise.all([
        storage.getActiveAlerts(),
        fetchSecurityAlerts().then(convertToAppAlerts)
      ]);
      
      // Combine and sort by timestamp
      const allAlerts = [...dbAlerts, ...newsAlerts].sort(
        (a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime()
      );
      
      res.json(allAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to just database alerts if news fetch fails
      try {
        const dbAlerts = await storage.getActiveAlerts();
        res.json(dbAlerts);
      } catch (dbError) {
        res.status(500).json({ message: "Failed to fetch alerts" });
      }
    }
  });

  // Create new alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      // Broadcast new alert to all connected clients
      broadcast({
        type: 'new_alert',
        data: alert,
        timestamp: new Date().toISOString()
      });

      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Failed to create alert" });
    }
  });

  // Get threats
  app.get("/api/threats", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const threats = await storage.getThreats(limit);
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threats" });
    }
  });

  // Create threat with AI analysis
  app.post("/api/threats", async (req, res) => {
    try {
      const validatedData = insertThreatSchema.parse(req.body);
      
      // Analyze threat with AI
      const aiAnalysis = await analyzeThreat(validatedData.description);
      const enrichedThreat = {
        ...validatedData,
        confidence: aiAnalysis.confidence,
        metadata: {
          ...validatedData.metadata,
          aiAnalysis,
        },
      };

      const threat = await storage.createThreat(enrichedThreat);
      
      // Create corresponding alert if threat is high severity
      if (threat.severity === 'high' || threat.severity === 'critical') {
        const alert = await storage.createAlert({
          threatId: threat.id,
          title: `${threat.severity.toUpperCase()} THREAT DETECTED`,
          message: threat.title,
          severity: threat.severity === 'critical' ? 'emergency' : 'alert',
          targetArea: threat.location,
        });

        broadcast({
          type: 'threat_alert',
          data: { threat, alert },
          timestamp: new Date().toISOString()
        });
      }

      res.json(threat);
    } catch (error) {
      res.status(400).json({ message: "Failed to create threat" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const reports = await storage.getReports(userId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Submit report with media upload and AI analysis
  app.post("/api/reports", upload.array('media', 5), async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse({
        ...req.body,
        isAnonymous: req.body.isAnonymous === 'true',
      });

      const files = req.files as Express.Multer.File[];
      const mediaUrls: string[] = [];
      let aiAnalysis: any = {};

      // Process uploaded files
      if (files && files.length > 0) {
        for (const file of files) {
          // Move file to permanent location
          const filename = `${Date.now()}-${file.originalname}`;
          const permanentPath = path.join('uploads', filename);
          fs.renameSync(file.path, permanentPath);
          mediaUrls.push(`/uploads/${filename}`);

          // Analyze image with AI if it's an image
          if (file.mimetype.startsWith('image/')) {
            try {
              const imageBuffer = fs.readFileSync(permanentPath);
              const base64Image = imageBuffer.toString('base64');
              const imageAnalysis = await analyzeImage(base64Image);
              aiAnalysis.imageAnalysis = imageAnalysis;
            } catch (error) {
              console.error('Image analysis failed:', error);
            }
          }
        }
      }

      // Analyze threat description with AI
      const textAnalysis = await analyzeThreat(validatedData.description);
      aiAnalysis.textAnalysis = textAnalysis;

      const reportData = {
        ...validatedData,
        media: mediaUrls,
        aiAnalysis,
      };

      const report = await storage.createReport(reportData);

      // Auto-escalate high-confidence threats
      if (textAnalysis.confidence > 0.8 && validatedData.urgencyLevel === 'critical') {
        const threat = await storage.createThreat({
          type: validatedData.threatType,
          severity: 'high',
          title: `Reported: ${validatedData.threatType}`,
          description: validatedData.description,
          location: validatedData.location,
          source: 'user',
          confidence: textAnalysis.confidence.toString(),
        });

        broadcast({
          type: 'urgent_report',
          data: { report, threat },
          timestamp: new Date().toISOString()
        });
      }

      res.json(report);
    } catch (error) {
      console.error('Report submission error:', error);
      res.status(400).json({ message: "Failed to submit report" });
    }
  });

  // Get safe zones
  app.get("/api/safe-zones", async (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;

      const location = lat && lng ? { lat, lng, radius } : undefined;
      const safeZones = await storage.getSafeZones(location);
      res.json(safeZones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe zones" });
    }
  });

  // Get education resources
  app.get("/api/education", async (req, res) => {
    try {
      const category = req.query.category as string;
      const resources = await storage.getEducationResources(category);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch education resources" });
    }
  });

  // Get emergency contacts
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  // Location tracking endpoints
  app.post("/api/location/update", async (req, res) => {
    try {
      const { latitude, longitude, accuracy, timestamp } = req.body;
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      // Store location in memory
      userLocations.set(sessionId, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : undefined,
        timestamp: timestamp || new Date().toISOString(),
        sessionId,
      });

      // Broadcast location update to all connected clients
      broadcast({
        type: 'location_update',
        data: {
          sessionId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy,
          timestamp: timestamp || new Date().toISOString(),
        }
      });

      res.json({ 
        success: true, 
        message: "Location updated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Location update error:', error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.get("/api/location/current", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string || 'anonymous';
      const location = userLocations.get(sessionId);
      
      if (!location) {
        return res.status(404).json({ message: "No location data found" });
      }

      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current location" });
    }
  });

  app.get("/api/location/all", async (req, res) => {
    try {
      const allLocations = Array.from(userLocations.values());
      res.json(allLocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get all locations" });
    }
  });

  // AI threat prediction endpoint
  app.get("/api/ai/threat-prediction", async (req, res) => {
    try {
      const prediction = await generateThreatPrediction();
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate threat prediction" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      connections: wsConnections.size,
    });
  });

  return httpServer;
}
