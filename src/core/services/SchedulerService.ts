import { FORM_DATA_SETS } from '../../config/formDataSets';
import { CreateJobRequest } from '../../types';
import { JobService } from './JobService';

// Background service that automatically creates new form-filling jobs on a schedule
// Creates jobs every 5 minutes using predefined form data sets for automated testing
export class SchedulerService {
  private isScheduling = false;
  private schedulingInterval: NodeJS.Timeout | null = null;

  constructor(private jobService: JobService) {}

  // Starts automatic job scheduling
  startScheduling(): void {
    if (this.isScheduling) return;
    
    this.isScheduling = true;
    console.log('Scheduler started - will create jobs every 5 minutes');
    
    // Create first job immediately
    this.createScheduledJob();
    
    // Schedule jobs every 5 minutes
    this.schedulingInterval = setInterval(() => {
      this.createScheduledJob();
    }, 5 * 60 * 1000);
  }

  // Stops automatic job scheduling
  stopScheduling(): void {
    if (!this.isScheduling) return;
    
    this.isScheduling = false;
    if (this.schedulingInterval) {
      clearInterval(this.schedulingInterval);
      this.schedulingInterval = null;
    }
    console.log('Scheduler stopped');
  }

  // Creates a scheduled job with predefined form data
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

  // Returns the current status of the scheduler
  getStatus(): { isScheduling: boolean; nextJobIn?: number } {
    return {
      isScheduling: this.isScheduling
    };
  }
}