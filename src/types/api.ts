// Job status enum
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Request to create a new job
export interface CreateJobRequest {
  url: string;
  formData: Record<string, string>;
  name?: string; // Optional job name for identification
}

// Job object with all properties
export interface Job {
  id: string;
  status: JobStatus;
  url: string;
  formData: Record<string, string>;
  name?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: {
    success: boolean;
    fieldsFilled: number;
    completionTime: string;
    error?: string;
  };
}

// Response when creating a job
export interface CreateJobResponse {
  jobId: string;
  status: JobStatus;
  message: string;
}

// Response when checking job status
export interface JobStatusResponse {
  job: Job;
}

// Response for listing all jobs
export interface JobsListResponse {
  jobs: Job[];
  total: number;
}