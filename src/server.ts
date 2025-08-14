import cors from 'cors';
import express from "express";
import formRoutes from './api/routes/formRoutes';
import { AgentService } from './core/services/AgentService';
import { JobProcessor } from './core/services/JobProcessor';
import { JobService } from './core/services/JobService';
import { SchedulerService } from './core/services/SchedulerService';

// Main Express server application
// Sets up the HTTP server, middleware, routes, and background services
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup for cross-origin requests and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize core services for job management and form processing
const jobService = new JobService();
const agentService = new AgentService(jobService);
const jobProcessor = new JobProcessor(jobService, agentService);
const schedulerService = new SchedulerService(jobService);

// Make jobService available to routes via app.locals
app.locals.jobService = jobService;

// Health check endpoint for monitoring system status
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes for form filling operations
app.use('/api', formRoutes)

// Start server and background services
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Form API: http://localhost:${PORT}/api/fill-form`);

  // Start background job processing
  jobProcessor.startProcessing();
  console.log('Job processor started - will process pending jobs automatically');
  
  // Start scheduled job creation
  schedulerService.startScheduling();
  console.log('Scheduler started - will create jobs every 5 minutes');
});