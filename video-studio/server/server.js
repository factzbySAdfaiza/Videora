// Express server for video generation web application
// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { validateTsxCode, validateVideoConfig, validatePrompt } = require('./validator');
const { createJob, getJobStatus, getVideoPath, deleteJob, cleanupOldJobs, updateJobStatus } = require('./videoGenerator');
const { generateTsxFromPrompt, enhancePrompt } = require('./aiService');
const { 
    createLongVideoJob, 
    getLongJobStatus, 
    getLongVideoPath, 
    deleteLongJob,
    shouldUseMultiSegment,
    MULTI_SEGMENT_THRESHOLD 
} = require('./longVideoGenerator');

// Load environment variables (API keys)
const AI_PROVIDER = process.env.AI_PROVIDER || 'openrouter'; // 'claude', 'openai', 'a4f', or 'openrouter'
const AI_API_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder:free';
const A4F_ENHANCER_KEY = process.env.A4F_ENHANCER_KEY || ''; // Separate A4F key for prompt enhancement

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Example prompts for users
const EXAMPLE_PROMPTS = [
    {
        title: 'Bouncing Subscribe Button',
        prompt: 'Create a red Subscribe button that appears with a bounce effect',
        description: 'A simple animated button with bounce animation',
    },
    {
        title: 'Countdown Timer',
        prompt: 'Make a countdown from 5 to 1 with blue neon effect',
        description: 'Animated countdown with glowing numbers',
    },
    {
        title: 'Typewriter Text',
        prompt: 'Create text that says NEW VIDEO with a typewriter effect',
        description: 'Text appearing letter by letter',
    },
    {
        title: 'Spinning Logo',
        prompt: 'Create a circular logo that spins and glows',
        description: 'Rotating logo with glow effect',
    },
];

// Routes

/**
 * GET / - Serve the main application
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * GET /api/examples - Get example prompts
 */
app.get('/api/examples', (req, res) => {
    res.json({ examples: EXAMPLE_PROMPTS });
});

/**
 * POST /api/generate - Generate video from TSX code (Option 1)
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { tsxCode, config } = req.body;

        // Validate TSX code
        const tsxValidation = validateTsxCode(tsxCode);
        if (!tsxValidation.valid) {
            return res.status(400).json({
                error: 'Invalid TSX code',
                details: tsxValidation.errors,
            });
        }

        // Validate video configuration
        const configValidation = validateVideoConfig(config || {});
        if (!configValidation.valid) {
            return res.status(400).json({
                error: 'Invalid video configuration',
                details: configValidation.errors,
            });
        }

        // Create job
        const jobId = await createJob(tsxCode, configValidation.config);

        res.json({
            success: true,
            jobId,
            message: 'Video generation started',
        });
    } catch (error) {
        console.error('Generate endpoint error:', error);
        res.status(500).json({
            error: 'Failed to start video generation',
            details: error.message,
        });
    }
});

/**
 * POST /api/generate-ai - Generate video from text prompt (Option 2)
 * Uses AI API to convert prompt to TSX code, then generates video
 * Supports multi-segment generation for longer videos (>15s)
 */
app.post('/api/generate-ai', async (req, res) => {
    try {
        console.log('AI Generate request received:', {
            hasPrompt: !!req.body.prompt,
            hasConfig: !!req.body.config,
            bodyKeys: Object.keys(req.body)
        });

        const { prompt, config } = req.body;

        // Check if request body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Request body is required',
                message: 'Please send a valid JSON request with prompt and config'
            });
        }

        // Check if AI is configured
        if (!AI_API_KEY) {
            return res.status(503).json({
                error: 'AI service not configured',
                message: 'Please set AI_API_KEY environment variable to enable AI generation',
            });
        }

        // Validate prompt
        if (!prompt) {
            return res.status(400).json({
                error: 'Prompt is required',
                message: 'Please provide a prompt describing the video you want to create'
            });
        }

        const promptValidation = validatePrompt(prompt);
        if (!promptValidation.valid) {
            return res.status(400).json({
                error: 'Invalid prompt',
                details: promptValidation.errors,
                message: promptValidation.errors.join('. ')
            });
        }

        // Validate video configuration
        const configValidation = validateVideoConfig(config || {});
        if (!configValidation.valid) {
            return res.status(400).json({
                error: 'Invalid video configuration',
                details: configValidation.errors,
            });
        }

        const finalConfig = configValidation.config;
        const duration = finalConfig.duration || 5;

        // Enhance the prompt if A4F enhancer key is available
        let enhancedPrompt = prompt;
        if (A4F_ENHANCER_KEY) {
            console.log('✨ Enhancing prompt with AI...');
            try {
                enhancedPrompt = await enhancePrompt(prompt, A4F_ENHANCER_KEY);
            } catch (error) {
                console.warn('Prompt enhancement failed, using original:', error.message);
            }
        }

        // Determine if we should use multi-segment generation
        const useMultiSegment = shouldUseMultiSegment(duration);
        
        if (useMultiSegment) {
            // Use long video generator for videos > 15 seconds
            console.log(`🎬 Using multi-segment generation for ${duration}s video`);
            
            const jobId = await createLongVideoJob(
                enhancedPrompt,
                finalConfig,
                generateTsxFromPrompt,
                {
                    provider: AI_PROVIDER,
                    apiKey: AI_API_KEY,
                    model: OPENROUTER_MODEL
                }
            );

            res.json({
                success: true,
                jobId,
                message: `Multi-segment video generation started (${duration}s video)`,
                isMultiSegment: true,
                estimatedSegments: Math.ceil(duration / 10)
            });
        } else {
            // Use standard single-segment generation
            console.log(`🎨 Using single-segment generation for ${duration}s video`);
            console.log(`📝 Original prompt: "${prompt.substring(0, 50)}..."`);

            console.log(`🎨 Generating TSX code with ${AI_PROVIDER}...`);
            const tsxCode = await generateTsxFromPrompt(enhancedPrompt, {
                provider: AI_PROVIDER,
                apiKey: AI_API_KEY,
                model: OPENROUTER_MODEL
            });

            console.log('TSX code generated successfully');

            // Validate generated code
            const tsxValidation = validateTsxCode(tsxCode);
            if (!tsxValidation.valid) {
                console.error('AI generated invalid code:', tsxValidation.errors);
                return res.status(500).json({
                    error: 'AI generated invalid code',
                    details: tsxValidation.errors,
                });
            }

            // Create video generation job
            const jobId = await createJob(tsxCode, finalConfig);

            res.json({
                success: true,
                jobId,
                message: 'AI video generation started',
                isMultiSegment: false
            });
        }
    } catch (error) {
        console.error('AI generate endpoint error:', error);
        res.status(500).json({
            error: 'Failed to generate video with AI',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * GET /api/status/:jobId - Get job status
 * Checks both standard and long video job stores
 */
app.get('/api/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    
    // Try standard job first
    let status = getJobStatus(jobId);
    
    // If not found, try long video job
    if (!status) {
        status = getLongJobStatus(jobId);
    }

    if (!status) {
        return res.status(404).json({
            error: 'Job not found',
        });
    }

    res.json(status);
});

/**
 * GET /api/video/:jobId - Download generated video
 * Checks both standard and long video job stores
 */
app.get('/api/video/:jobId', (req, res) => {
    const { jobId } = req.params;
    
    // Try standard job first
    let videoPath = getVideoPath(jobId);
    
    // If not found, try long video job
    if (!videoPath) {
        videoPath = getLongVideoPath(jobId);
    }

    if (!videoPath) {
        return res.status(404).json({
            error: 'Video not found or not ready',
        });
    }

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
        return res.status(404).json({
            error: 'Video file not found',
        });
    }

    // Set headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        });

        file.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(videoPath).pipe(res);
    }

    // Handle connection errors silently
    res.on('error', (err) => {
        if (err.code === 'ECONNABORTED' || err.code === 'EPIPE') {
            // Client disconnected, ignore
            console.log(`Client disconnected during video download: ${jobId}`);
        } else {
            console.error('Download error:', err);
        }
    });
});

/**
 * DELETE /api/video/:jobId - Delete video and job
 * Checks both standard and long video job stores
 */
app.delete('/api/video/:jobId', async (req, res) => {
    const { jobId } = req.params;
    
    // Try standard job first
    let deleted = await deleteJob(jobId);
    
    // If not found, try long video job
    if (!deleted) {
        deleted = await deleteLongJob(jobId);
    }

    if (!deleted) {
        return res.status(404).json({
            error: 'Job not found',
        });
    }

    res.json({
        success: true,
        message: 'Video deleted successfully',
    });
});

/**
 * GET /api/segment-info - Get information about multi-segment generation
 */
app.get('/api/segment-info', (req, res) => {
    res.json({
        multiSegmentThreshold: MULTI_SEGMENT_THRESHOLD,
        maxSegmentDuration: 15,
        minSegmentDuration: 5,
        description: `Videos longer than ${MULTI_SEGMENT_THRESHOLD} seconds are automatically split into multiple segments for better quality and reliability.`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Video Studio server running on http://localhost:${PORT}`);
    console.log(`📁 Ready to generate videos!`);

    // Run cleanup every hour
    setInterval(() => {
        cleanupOldJobs(24);
    }, 60 * 60 * 1000);
});
