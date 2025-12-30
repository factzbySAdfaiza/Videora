// Express server for video generation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { validateTsxCode, validateVideoConfig, validatePrompt } = require('./validator');
const { createJob, getJobStatus, getVideoPath, deleteJob, cleanupOldJobs } = require('./videoGenerator');
const { generateTsxFromPrompt, enhancePrompt } = require('./aiService');

const AI_PROVIDER = process.env.AI_PROVIDER || 'openrouter';
const AI_API_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder:free';
const A4F_ENHANCER_KEY = process.env.A4F_ENHANCER_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Allow frontend origin
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Video Studio API Server' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example prompts
const EXAMPLE_PROMPTS = [
    { title: 'Bouncing Subscribe Button', prompt: 'Create a red Subscribe button that appears with a bounce effect', description: 'A simple animated button with bounce animation' },
    { title: 'Countdown Timer', prompt: 'Make a countdown from 5 to 1 with blue neon effect', description: 'Animated countdown with glowing numbers' },
    { title: 'Typewriter Text', prompt: 'Create text that says NEW VIDEO with a typewriter effect', description: 'Text appearing letter by letter' },
    { title: 'Spinning Logo', prompt: 'Create a circular logo that spins and glows', description: 'Rotating logo with glow effect' },
];

app.get('/api/examples', (req, res) => {
    res.json({ examples: EXAMPLE_PROMPTS });
});

// Generate video from TSX code
app.post('/api/generate', async (req, res) => {
    try {
        const { tsxCode, config } = req.body;

        const tsxValidation = validateTsxCode(tsxCode);
        if (!tsxValidation.valid) {
            return res.status(400).json({ error: 'Invalid TSX code', details: tsxValidation.errors });
        }

        const configValidation = validateVideoConfig(config || {});
        if (!configValidation.valid) {
            return res.status(400).json({ error: 'Invalid video configuration', details: configValidation.errors });
        }

        const jobId = await createJob(tsxCode, configValidation.config);
        res.json({ success: true, jobId, message: 'Video generation started' });
    } catch (error) {
        console.error('Generate endpoint error:', error);
        res.status(500).json({ error: 'Failed to start video generation', details: error.message });
    }
});

// Generate video from AI prompt
app.post('/api/generate-ai', async (req, res) => {
    try {
        const { prompt, config } = req.body;

        if (!AI_API_KEY) {
            return res.status(503).json({ error: 'AI service not configured', message: 'Please set AI_API_KEY environment variable' });
        }

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const promptValidation = validatePrompt(prompt);
        if (!promptValidation.valid) {
            return res.status(400).json({ error: 'Invalid prompt', details: promptValidation.errors });
        }

        const configValidation = validateVideoConfig(config || {});
        if (!configValidation.valid) {
            return res.status(400).json({ error: 'Invalid video configuration', details: configValidation.errors });
        }

        let enhancedPrompt = prompt;
        if (A4F_ENHANCER_KEY) {
            try {
                enhancedPrompt = await enhancePrompt(prompt, A4F_ENHANCER_KEY);
            } catch (error) {
                console.warn('Prompt enhancement failed:', error.message);
            }
        }

        console.log(`Generating TSX with ${AI_PROVIDER}...`);
        const tsxCode = await generateTsxFromPrompt(enhancedPrompt, {
            provider: AI_PROVIDER,
            apiKey: AI_API_KEY,
            model: OPENROUTER_MODEL
        });

        const tsxValidation = validateTsxCode(tsxCode);
        if (!tsxValidation.valid) {
            return res.status(500).json({ error: 'AI generated invalid code', details: tsxValidation.errors });
        }

        const jobId = await createJob(tsxCode, configValidation.config);
        res.json({ success: true, jobId, message: 'AI video generation started' });
    } catch (error) {
        console.error('AI generate error:', error);
        res.status(500).json({ error: 'Failed to generate video with AI', message: error.message });
    }
});

// Get job status
app.get('/api/status/:jobId', (req, res) => {
    const status = getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: 'Job not found' });
    res.json(status);
});

// Download video
app.get('/api/video/:jobId', (req, res) => {
    const videoPath = getVideoPath(req.params.jobId);
    if (!videoPath || !fs.existsSync(videoPath)) {
        return res.status(404).json({ error: 'Video not found' });
    }

    const stat = fs.statSync(videoPath);
    const range = req.headers.range;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Content-Length': (end - start) + 1,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
        res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'video/mp4' });
        fs.createReadStream(videoPath).pipe(res);
    }
});

// Delete video
app.delete('/api/video/:jobId', async (req, res) => {
    const deleted = await deleteJob(req.params.jobId);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, message: 'Video deleted' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🎬 Video Studio API running on port ${PORT}`);
    setInterval(() => cleanupOldJobs(24), 60 * 60 * 1000);
});
