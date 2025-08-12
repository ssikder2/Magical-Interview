import { JobStatus } from '../types/api';
import { AgentService } from './agentService';
import { JobService } from './jobService';

export class JobProcessor {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    private jobService: JobService,
    private agentService: AgentService
  ) {}

  // Start processing jobs in the background
  startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log('Job processor started');

    // Process jobs every 2 seconds
    this.processingInterval = setInterval(() => {
      this.processNextJob();
    }, 2000);
  }

  // Stop processing jobs
  stopProcessing(): void {
    if (!this.isProcessing) return;

    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('Job processor stopped');
  }

  // Process next pending job
  private async processNextJob(): Promise<void> {
    const jobs = this.jobService.getAllJobs();
    const pendingJob = jobs.find(job => job.status === JobStatus.PENDING);

    if (pendingJob) {
      console.log(`Processing job ${pendingJob.id}`);
      await this.agentService.processJob(pendingJob);
    }
  }
}