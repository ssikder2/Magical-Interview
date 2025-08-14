import cors from 'cors';
import express from "express";
import formRoutes from './api/routes/formRoutes';
import { AgentService } from './core/services/AgentService';
import { JobProcessor } from './core/services/JobProcessor';
import { JobService } from './core/services/JobService';
import { SchedulerService } from './core/services/SchedulerService';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize services
const jobService = new JobService();
const agentService = new AgentService(jobService);
const jobProcessor = new JobProcessor(jobService, agentService);
const schedulerService = new SchedulerService(jobService);

app.locals.jobService = jobService;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', formRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Form API: http://localhost:${PORT}/api/fill-form`);

  jobProcessor.startProcessing();
  console.log('Job processor started - will process pending jobs automatically');
  
  schedulerService.startScheduling();
  console.log('Scheduler started - will create jobs every 5 minutes');
});