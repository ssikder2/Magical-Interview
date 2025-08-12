import { chromium } from 'playwright';
import { MedicalFormAgent } from '../agent/medicalFormAgent';
import { Job, JobStatus } from '../types/api';
import { JobService } from './jobService';

export class AgentService {
  constructor(private jobService: JobService) {}

  async processJob(job: Job): Promise<void> {
    try {
      console.log(`Starting job ${job.id} - ${job.name || 'Unnamed job'}`);
      this.jobService.updateJobStatus(job.id, JobStatus.RUNNING);

      const browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();

      console.log(`Opening ${job.url}`);
      await page.goto(job.url);

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