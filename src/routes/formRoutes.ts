import { Request, Response, Router } from 'express';
import { CreateJobRequest } from '../types/api';

const router = Router();

// Create a new form-filling job
router.post('/fill-form', (req: Request, res: Response) => {
  try {
    const { url, formData, name }: CreateJobRequest = req.body;

    if (!url || !formData) {
      return res.status(400).json({
        error: 'Missing required fields: url and formData are required'
      });
    }

    const job = req.app.locals.jobService.CreateJob({ url, formData, name });

    res.status(201).json({
      jobId: job.id,
      status: job.status,
      message: 'Job created successfully'
    });

  } catch (error) {
    console.error('Error creating job: ', error);
    res.status(500).json({
      error: 'Failed to create job'
    });
  }
});

// Get job status by ID
router.get('/jobs/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = req.app.locals.jobService.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    res.json({ job });

  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({
      error: 'Failed to get job'
    });
  }
});

// Get all jobs
router.get('/jobs', (req: Request, res: Response) => {
  try {
    const jobs = req.app.locals.jobService.getAllJobs();

    res.json({
      jobs,
      total: jobs.length
    });
  
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({
      error: 'Failed to get jobs'
    });
  }
});

export default router;