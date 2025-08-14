import { FORM_DATA_SETS } from '../../config/formDataSets';
import { CreateJobRequest } from '../../types';
import { JobService } from './JobService';

export class SchedulerService {
  private schedulingInterval: NodeJS.Timeout | null = null;
  private isScheduling = false;

  constructor(private jobService: JobService) {}

  // Start automatic job scheduling
  startScheduling(): void {
    if (this.isScheduling) return;
    
    this.isScheduling = true;
    console.log('Scheduler started - will create jobs every 5 minutes');
    
    this.createScheduledJob();
    
    // Schedule jobs every 5 minutes
    this.schedulingInterval = setInterval(() => {
      this.createScheduledJob();
    }, 5 * 60 * 1000);
  }

  // Stop automatic job scheduling
  stopScheduling(): void {
    if (!this.isScheduling) return;
    
    this.isScheduling = false;
    if (this.schedulingInterval) {
      clearInterval(this.schedulingInterval);
      this.schedulingInterval = null;
    }
    console.log('Scheduler stopped');
  }

  // Create a scheduled job with predefined form data
  private createScheduledJob(): void {
    // Pick a random form data set
    const randomSet = FORM_DATA_SETS[Math.floor(Math.random() * FORM_DATA_SETS.length)];
    
    const jobRequest: CreateJobRequest = {
      url: randomSet.url,
      formData: randomSet.formData,
      name: randomSet.name
    };

    const job = this.jobService.CreateJob(jobRequest);
    console.log(`Created scheduled job: ${job.id} (${randomSet.name})`);
  }

  // Get scheduler status
  getStatus(): { isScheduling: boolean; nextJobIn?: number } {
    return {
      isScheduling: this.isScheduling
    };
  }
}