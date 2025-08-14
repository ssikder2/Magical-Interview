import { CreateJobRequest, Job, JobStatus } from '../../types';

export class JobService {
  private jobs: Map<string, Job> = new Map();
  private nextJobId = 1;

  // Create a new job
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

  // Get job by ID
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Update job status
  updateJobStatus(jobId: string, status: JobStatus, result?: Job['result']): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.status = status;

    if (status === JobStatus.RUNNING && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.completedAt = new Date();
      if (result) {
        job.result = result;
      }
    }


    if (status === JobStatus.RUNNING) {
      console.log(`Job ${jobId} is now running`);
    } else if (status === JobStatus.COMPLETED) {
      console.log(`Job ${jobId} completed successfully`);
    } else if (status === JobStatus.FAILED) {
      console.log(`Job ${jobId} failed`);
    }
    
    return true;
  }

  // Delete job
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }
}