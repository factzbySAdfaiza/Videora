// Video generation module using Remotion
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Job storage (in-memory, upgrade to Redis for production)
const jobs = new Map();

// Video configuration
const VIDEO_CONFIG = {
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
};

/**
 * Updates video configuration in Root.tsx
 */
async function updateVideoConfig(config = VIDEO_CONFIG) {
    const rootPath = path.join(__dirname, '../src/Root.tsx');
    const template = `import React from 'react';
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

// =====================================================
// VIDEO SETTINGS - Automatically configured
// =====================================================
const DURATION_SECONDS = ${config.duration};
const FPS = ${config.fps};
const WIDTH = ${config.width};
const HEIGHT = ${config.height};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
`;

    await fs.writeFile(rootPath, template, 'utf-8');
}

/**
 * Creates a new video generation job
 */
async function createJob(tsxCode, config = {}) {
    const jobId = require('uuid').v4();

    jobs.set(jobId, {
        id: jobId,
        status: 'pending',
        statusMessage: 'Preparing video generation...',
        progress: 0,
        createdAt: new Date(),
        tsxCode,
        config: { ...VIDEO_CONFIG, ...config },
        videoPath: null,
        error: null,
    });

    // Start processing asynchronously
    processJob(jobId).catch(err => {
        console.error(`Job ${jobId} failed:`, err);
        const job = jobs.get(jobId);
        if (job) {
            job.status = 'failed';
            job.error = err.message;
            job.statusMessage = `Failed: ${err.message}`;
        }
    });

    return jobId;
}

/**
 * Updates job status with message
 */
function updateJobStatus(jobId, status, message, progress = 0) {
    const job = jobs.get(jobId);
    if (job) {
        job.status = status;
        job.statusMessage = message;
        job.progress = progress;
    }
}

/**
 * Processes a video generation job
 */
async function processJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    try {
        // Update Root.tsx with video configuration
        updateJobStatus(jobId, 'processing', 'Configuring video settings...', 10);
        await updateVideoConfig(job.config);

        // Write TSX code to MyVideo.tsx
        updateJobStatus(jobId, 'processing', 'Writing video code...', 20);
        const myVideoPath = path.join(__dirname, '../src/MyVideo.tsx');
        await fs.writeFile(myVideoPath, job.tsxCode, 'utf-8');

        // Execute Remotion rendering
        updateJobStatus(jobId, 'processing', 'Starting Remotion render...', 30);

        // Create videos directory if it doesn't exist
        const videosDir = path.join(__dirname, '../videos');
        try {
            await fs.access(videosDir);
        } catch {
            await fs.mkdir(videosDir, { recursive: true });
        }

        // Generate output filename
        const outputPath = path.join(videosDir, `${jobId}.mp4`);
        updateJobStatus(jobId, 'processing', 'Rendering video frames...', 40);

        // Run Remotion render
        console.log(`Starting render for job ${jobId}...`);
        const renderCommand = `npx remotion render src/index.ts MyVideo "${outputPath}"`;

        updateJobStatus(jobId, 'processing', 'Rendering video...', 50);
        const { stdout, stderr } = await execPromise(renderCommand, {
            cwd: path.join(__dirname, '..'),
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        });

        console.log(`Render output: ${stdout}`);
        if (stderr) console.error(`Render warnings: ${stderr}`);

        updateJobStatus(jobId, 'processing', 'Finalizing video...', 90);

        // Verify output file exists
        try {
            await fs.access(outputPath);
            job.videoPath = outputPath;
            job.status = 'completed';
            job.statusMessage = 'Video ready for download!';
            job.progress = 100;
            job.completedAt = new Date();
            console.log(`✅ Job ${jobId} completed successfully`);
        } catch {
            throw new Error('Video file was not generated');
        }

    } catch (error) {
        console.error(`Job ${jobId} processing error:`, error);
        job.status = 'failed';
        job.statusMessage = 'Generation failed';
        job.error = error.message;
        job.progress = 0;
    }
}

/**
 * Gets job status
 */
function getJobStatus(jobId) {
    const job = jobs.get(jobId);
    if (!job) return null;

    return {
        id: job.id,
        status: job.status,
        statusMessage: job.statusMessage,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        error: job.error,
    };
}

/**
 * Gets video file path for completed job
 */
function getVideoPath(jobId) {
    const job = jobs.get(jobId);
    if (!job || job.status !== 'completed') return null;
    return job.videoPath;
}

/**
 * Deletes a job and its video file
 */
async function deleteJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) return false;

    // Delete video file if it exists
    if (job.videoPath) {
        try {
            await fs.unlink(job.videoPath);
        } catch (err) {
            console.error(`Failed to delete video file: ${err.message}`);
        }
    }

    jobs.delete(jobId);
    return true;
}

/**
 * Cleanup old jobs (run periodically)
 */
async function cleanupOldJobs(maxAgeHours = 24) {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const [jobId, job] of jobs.entries()) {
        const age = now - job.createdAt;
        if (age > maxAge) {
            await deleteJob(jobId);
            console.log(`Cleaned up old job: ${jobId}`);
        }
    }
}

module.exports = {
    createJob,
    getJobStatus,
    getVideoPath,
    deleteJob,
    cleanupOldJobs,
    updateJobStatus,
};
