import { chromium } from 'playwright';
import { Job, JobStatus } from '../../types';
import { MedicalFormAgent } from '../agent/MedicalFormAgent';
import { JobService } from './JobService';

// Service that orchestrates the execution of a single form-filling job
// Launches a browser, navigates to the target URL, and runs the AI agent
export class AgentService {
  constructor(private jobService: JobService) {}

  // Processes a single form-filling job by launching browser and running the agent
  async processJob(job: Job): Promise<void> {
    try {
      console.log(`Starting job ${job.id} - ${job.name || 'Unnamed job'}`);
      this.jobService.updateJobStatus(job.id, JobStatus.RUNNING);

      // Launch browser and create new page for this job
      const browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();

      // Navigate to target URL with retry logic for reliability
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Opening ${job.url} (attempt ${retryCount + 1})`);
          await page.goto(job.url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          break;
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to load page after ${maxRetries} attempts: ${(error as any).message}`);
          }
          console.log(`Page load failed, retrying in 5 seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Initialize and run the AI agent to fill out the form
      console.log(`Agent starting for job ${job.id}`);
      const agent = new MedicalFormAgent(page, job.formData);

      await agent.run();

      // Mark job as completed successfully
      console.log(`Job ${job.id} completed successfully`);
      this.jobService.updateJobStatus(job.id, JobStatus.COMPLETED, {
        success: true,
        fieldsFilled: Object.keys(job.formData).length,
        completionTime: new Date().toISOString()
      });

      await browser.close();

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      // Mark job as failed with error details
      this.jobService.updateJobStatus(job.id, JobStatus.FAILED, {
        success: false,
        fieldsFilled: 0,
        completionTime: new Date().toISOString(),
        error: (error as any).message
      });
    }
  }
}