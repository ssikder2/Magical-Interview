import { chromium } from 'playwright';
import { Job, JobStatus } from '../../types';
import { MedicalFormAgent } from '../agent/MedicalFormAgent';
import { JobService } from './JobService';

export class AgentService {
  constructor(private jobService: JobService) {}

  async processJob(job: Job): Promise<void> {
    try {
      console.log(`Starting job ${job.id} - ${job.name || 'Unnamed job'}`);
      this.jobService.updateJobStatus(job.id, JobStatus.RUNNING);

      const browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();

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

      console.log(`Agent starting for job ${job.id}`);
      const agent = new MedicalFormAgent(page, job.formData);

      await agent.run();

      console.log(`Job ${job.id} completed successfully`);
      this.jobService.updateJobStatus(job.id, JobStatus.COMPLETED, {
        success: true,
        fieldsFilled: Object.keys(job.formData).length,
        completionTime: new Date().toISOString()
      });

      await browser.close();

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      this.jobService.updateJobStatus(job.id, JobStatus.FAILED, {
        success: false,
        fieldsFilled: 0,
        completionTime: new Date().toISOString(),
        error: (error as any).message
      });
    }
  }
}