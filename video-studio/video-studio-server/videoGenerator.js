// Video generation module using Remotion
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const execPromise = promisify(exec);

const jobs = new Map();

const VIDEO_CONFIG = { duration: 5, fps: 30, width: 1920, height: 1080 };

async function updateVideoConfig(config = VIDEO_CONFIG) {
    const rootPath = path.join(__dirname, 'src/Root.tsx');
    const template = `import React from 'react';
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

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

async function createJob(tsxCode, config = {}) {
    const jobId = uuidv4();

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

function updateJobStatus(jobId, status, message, progress = 0) {
    const job = jobs.get(jobId);
    if (job) {
        job.status = status;
        job.statusMessage = message;
        job.progress = progress;
    }
}

async function processJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    try {
        updateJobStatus(jobId, 'processing', 'Configuring video settings...', 10);
        await updateVideoConfig(job.config);

        updateJobStatus(jobId, 'processing', 'Writing video code...', 20);
        const myVideoPath = path.join(__dirname, 'src/MyVideo.tsx');
        await fs.writeFile(myVideoPath, job.tsxCode, 'utf-8');

        updateJobStatus(jobId, 'processing', 'Starting Remotion render...', 30);

        const videosDir = path.join(__dirname, 'videos');
        try {
            await fs.access(videosDir);
        } catch {
            await fs.mkdir(videosDir, { recursive: true });
        }

        const outputPath = path.join(videosDir, `${jobId}.mp4`);
        updateJobStatus(jobId, 'processing', 'Rendering video...', 50);

        const renderCommand = `npx remotion render src/index.ts MyVideo "${outputPath}"`;
        const { stdout, stderr } = await execPromise(renderCommand, {
            cwd: __dirname,
            maxBuffer: 10 * 1024 * 1024,
        });

        console.log(`Render output: ${stdout}`);
        if (stderr) console.error(`Render warnings: ${stderr}`);

        updateJobStatus(jobId, 'processing', 'Finalizing video...', 90);

        try {
            await fs.access(outputPath);
            job.videoPath = outputPath;
            job.status = 'completed';
            job.statusMessage = 'Video ready!';
            job.progress = 100;
            job.completedAt = new Date();
            console.log(`✅ Job ${jobId} completed`);
        } catch {
            throw new Error('Video file was not generated');
        }
    } catch (error) {
        console.error(`Job ${jobId} error:`, error);
        job.status = 'failed';
        job.statusMessage = 'Generation failed';
        job.error = error.message;
        job.progress = 0;
    }
}

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

function getVideoPath(jobId) {
    const job = jobs.get(jobId);
    if (!job || job.status !== 'completed') return null;
    return job.videoPath;
}

async function deleteJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) return false;
    if (job.videoPath) {
        try { await fs.unlink(job.videoPath); } catch (err) { console.error(err); }
    }
    jobs.delete(jobId);
    return true;
}

async function cleanupOldJobs(maxAgeHours = 24) {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    for (const [jobId, job] of jobs.entries()) {
        if (now - job.createdAt > maxAge) {
            await deleteJob(jobId);
            console.log(`Cleaned up job: ${jobId}`);
        }
    }
}

module.exports = { createJob, getJobStatus, getVideoPath, deleteJob, cleanupOldJobs, updateJobStatus };
