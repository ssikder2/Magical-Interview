import { CreateJobRequest, Job, JobStatus } from '../../types';

// Service class that manages the lifecycle of form-filling jobs in the system
// Provides in-memory storage for job tracking, status updates, and job management operations
export class JobService {
  private jobs: Map<string, Job> = new Map();
  private nextJobId = 1;

  // Creates a new form-filling job and stores it in the system
  // Each job gets a unique identifier and is initialized with PENDING status
  CreateJob(request: CreateJobRequest): Job {
    const jobId = `job_${this.nextJobId++}`;
    
    const job: Job = {
      id: jobId,
      status: JobStatus.PENDING,
      url: request.url,
      formData: request.formData,
      name: request.name,
      createdAt: new Date()
    };
    
    this.jobs.set(jobId, job);
    console.log(`Created job ${jobId} for ${request.url}`);
    return job;
  }

  // Retrieves a specific job by its unique identifier
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Retrieves all jobs currently stored in the system
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Updates the status of a specific job and optionally adds result information
  updateJobStatus(jobId: string, status: JobStatus, result?: Job['result']): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.status = status;

    // Set start time when job begins running
    if (status === JobStatus.RUNNING && !job.startedAt) {
      job.startedAt = new Date();
    }

    // Set completion time and result when job finishes
    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.completedAt = new Date();
      if (result) {
        job.result = result;
      }
    }

    // Log status changes for monitoring and debugging
    if (status === JobStatus.RUNNING) {
      console.log(`Job ${jobId} is now running`);
    } else if (status === JobStatus.COMPLETED) {
      console.log(`Job ${jobId} completed successfully`);
    } else if (status === JobStatus.FAILED) {
      console.log(`Job ${jobId} failed`);
    }
    
    return true;
  }

  // Removes a job from the system by its unique identifier
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }
}