// =====================================================
// Long Video Generation Module
// =====================================================
// Orchestrates multi-segment video generation for longer videos

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const { v4: uuidv4 } = require('uuid');

const {
    calculateSegments,
    generateScenePrompts,
    getSegmentSystemPrompt,
    generateMultiSegmentRoot,
    generateSingleSegmentRoot,
    writeSegmentFiles,
    cleanupSegmentFiles,
    validateSegmentCode,
    fixSegmentCode
} = require('./segmentGenerator');

// Job storage for long video jobs
const longVideoJobs = new Map();

// Default configuration
const DEFAULT_CONFIG = {
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
};

// Threshold for multi-segment generation (seconds)
const MULTI_SEGMENT_THRESHOLD = 15;

/**
 * Creates a long video generation job
 * @param {string} prompt - User prompt for video generation
 * @param {Object} config - Video configuration
 * @param {Function} aiGenerator - AI generation function
 * @param {Object} aiOptions - AI provider options
 * @returns {string} Job ID
 */
async function createLongVideoJob(prompt, config, aiGenerator, aiOptions) {
    const jobId = uuidv4();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Calculate segments
    const segments = calculateSegments(finalConfig.duration, finalConfig.fps);
    const isMultiSegment = segments.length > 1;

    const job = {
        id: jobId,
        status: 'pending',
        statusMessage: 'Initializing video generation...',
        progress: 0,
        createdAt: new Date(),
        prompt,
        config: finalConfig,
        segments,
        isMultiSegment,
        segmentCodes: [],
        segmentStatuses: segments.map(() => 'pending'),
        videoPath: null,
        error: null,
    };

    longVideoJobs.set(jobId, job);

    // Start processing asynchronously
    processLongVideoJob(jobId, aiGenerator, aiOptions).catch(err => {
        console.error(`Long video job ${jobId} failed:`, err);
        const job = longVideoJobs.get(jobId);
        if (job) {
            job.status = 'failed';
            job.error = err.message;
            job.statusMessage = `Failed: ${err.message}`;
        }
    });

    return jobId;
}

/**
 * Updates job status
 */
function updateLongJobStatus(jobId, status, message, progress = 0) {
    const job = longVideoJobs.get(jobId);
    if (job) {
        job.status = status;
        job.statusMessage = message;
        job.progress = progress;
    }
}

/**
 * Processes a long video generation job
 */
async function processLongVideoJob(jobId, aiGenerator, aiOptions) {
    const job = longVideoJobs.get(jobId);
    if (!job) throw new Error('Job not found');

    const srcPath = path.join(__dirname, '../src');
    const videosDir = path.join(__dirname, '../videos');

    try {
        // Ensure videos directory exists
        await fs.mkdir(videosDir, { recursive: true });

        if (job.isMultiSegment) {
            // Multi-segment generation
            await processMultiSegmentJob(job, aiGenerator, aiOptions, srcPath);
        } else {
            // Single segment - use standard generation
            await processSingleSegmentJob(job, aiGenerator, aiOptions, srcPath);
        }

        // Render the video
        updateLongJobStatus(jobId, 'processing', 'Rendering video...', 80);
        
        const outputPath = path.join(videosDir, `${jobId}.mp4`);
        const renderCommand = `npx remotion render src/index.ts MyVideo "${outputPath}"`;

        console.log(`🎬 Starting render for job ${jobId}...`);
        const { stdout, stderr } = await execPromise(renderCommand, {
            cwd: path.join(__dirname, '..'),
            maxBuffer: 50 * 1024 * 1024, // 50MB buffer for longer videos
            timeout: 600000 // 10 minute timeout
        });

        console.log(`Render output: ${stdout}`);
        if (stderr) console.error(`Render warnings: ${stderr}`);

        // Verify output
        await fs.access(outputPath);
        
        // Cleanup segment files if multi-segment
        if (job.isMultiSegment) {
            await cleanupSegmentFiles(job.segments.length, srcPath);
        }

        // Update job as completed
        job.videoPath = outputPath;
        job.status = 'completed';
        job.statusMessage = 'Video ready for download!';
        job.progress = 100;
        job.completedAt = new Date();
        
        console.log(`✅ Long video job ${jobId} completed successfully`);

    } catch (error) {
        console.error(`Job ${jobId} processing error:`, error);
        job.status = 'failed';
        job.statusMessage = 'Generation failed';
        job.error = error.message;
        job.progress = 0;

        // Attempt cleanup on failure
        if (job.isMultiSegment) {
            try {
                await cleanupSegmentFiles(job.segments.length, srcPath);
            } catch (cleanupErr) {
                // Ignore cleanup errors
            }
        }
    }
}

/**
 * Processes a multi-segment video job
 */
async function processMultiSegmentJob(job, aiGenerator, aiOptions, srcPath) {
    const { segments, prompt, config } = job;
    const totalSegments = segments.length;

    console.log(`📊 Generating ${totalSegments} segments for ${config.duration}s video`);

    // Generate scene prompts
    const scenePrompts = generateScenePrompts(prompt, segments);

    // Generate each segment
    for (let i = 0; i < totalSegments; i++) {
        const scenePrompt = scenePrompts[i];
        const progressBase = 10 + (i / totalSegments) * 60; // 10-70% for segment generation

        updateLongJobStatus(
            job.id, 
            'processing', 
            `Generating scene ${i + 1} of ${totalSegments}...`, 
            Math.round(progressBase)
        );

        try {
            // Get segment-specific system prompt
            const systemPrompt = getSegmentSystemPrompt(scenePrompt, config);
            
            // Generate segment code using AI
            let segmentCode = await generateSegmentWithAI(
                scenePrompt.prompt,
                systemPrompt,
                aiGenerator,
                aiOptions
            );

            // Validate and fix the code
            const validation = validateSegmentCode(segmentCode, i);
            if (!validation.valid) {
                console.log(`⚠️ Fixing segment ${i} code issues:`, validation.errors);
                segmentCode = fixSegmentCode(segmentCode, i);
            }

            job.segmentCodes.push(segmentCode);
            job.segmentStatuses[i] = 'completed';

            console.log(`✅ Segment ${i + 1}/${totalSegments} generated`);

        } catch (error) {
            console.error(`❌ Failed to generate segment ${i}:`, error);
            job.segmentStatuses[i] = 'failed';
            throw new Error(`Failed to generate segment ${i + 1}: ${error.message}`);
        }
    }

    // Write all segment files
    updateLongJobStatus(job.id, 'processing', 'Writing segment files...', 72);
    await writeSegmentFiles(job.segmentCodes, srcPath);

    // Generate and write Root.tsx
    updateLongJobStatus(job.id, 'processing', 'Creating composition...', 75);
    const rootContent = generateMultiSegmentRoot(segments, config);
    await fs.writeFile(path.join(srcPath, 'Root.tsx'), rootContent, 'utf-8');

    console.log(`📝 Multi-segment composition created with ${totalSegments} scenes`);
}

/**
 * Processes a single-segment video job
 */
async function processSingleSegmentJob(job, aiGenerator, aiOptions, srcPath) {
    const { prompt, config } = job;

    updateLongJobStatus(job.id, 'processing', 'Generating video code...', 20);

    // Generate single video code
    const videoCode = await aiGenerator(prompt, aiOptions);

    // Write MyVideo.tsx
    updateLongJobStatus(job.id, 'processing', 'Writing video code...', 40);
    await fs.writeFile(path.join(srcPath, 'MyVideo.tsx'), videoCode, 'utf-8');

    // Generate and write Root.tsx
    updateLongJobStatus(job.id, 'processing', 'Creating composition...', 60);
    const rootContent = generateSingleSegmentRoot(config);
    await fs.writeFile(path.join(srcPath, 'Root.tsx'), rootContent, 'utf-8');

    console.log(`📝 Single-segment video created`);
}

/**
 * Generates segment code using AI with segment-specific prompt
 */
async function generateSegmentWithAI(scenePrompt, systemPrompt, aiGenerator, aiOptions) {
    // Create a modified AI call with segment-specific system prompt
    const { provider, apiKey, model } = aiOptions;

    // Use the appropriate AI provider
    switch (provider.toLowerCase()) {
        case 'claude':
            return await generateSegmentWithClaude(scenePrompt, systemPrompt, apiKey);
        case 'openai':
            return await generateSegmentWithOpenAI(scenePrompt, systemPrompt, apiKey);
        case 'a4f':
            return await generateSegmentWithA4F(scenePrompt, systemPrompt, apiKey);
        case 'openrouter':
            return await generateSegmentWithOpenRouter(scenePrompt, systemPrompt, apiKey, model);
        default:
            throw new Error(`Unknown AI provider: ${provider}`);
    }
}

/**
 * Generate segment with Claude
 */
async function generateSegmentWithClaude(prompt, systemPrompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: `${systemPrompt}\n\nCreate this scene: ${prompt}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data = await response.json();
    return extractCode(data.content[0].text);
}

/**
 * Generate segment with OpenAI
 */
async function generateSegmentWithOpenAI(prompt, systemPrompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

/**
 * Generate segment with A4F
 */
async function generateSegmentWithA4F(prompt, systemPrompt, apiKey) {
    const response = await fetch('https://api.a4f.co/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'provider-8/gemini-2.0-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`A4F API request failed: ${errorText}`);
    }

    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

/**
 * Generate segment with OpenRouter
 */
async function generateSegmentWithOpenRouter(prompt, systemPrompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/video-studio',
            'X-Title': 'Video Studio AI Generator',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return extractCode(data.choices[0].message.content);
}

/**
 * Extract code from markdown code blocks
 */
function extractCode(content) {
    const codeBlockRegex = /```(?:tsx|typescript|ts|javascript|js)?\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
        return matches[0][1].trim();
    }

    return content.trim();
}

/**
 * Gets job status
 */
function getLongJobStatus(jobId) {
    const job = longVideoJobs.get(jobId);
    if (!job) return null;

    return {
        id: job.id,
        status: job.status,
        statusMessage: job.statusMessage,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        error: job.error,
        isMultiSegment: job.isMultiSegment,
        segmentCount: job.segments?.length || 1,
        segmentStatuses: job.segmentStatuses,
        config: {
            duration: job.config.duration,
            fps: job.config.fps,
            width: job.config.width,
            height: job.config.height
        }
    };
}

/**
 * Gets video path for completed job
 */
function getLongVideoPath(jobId) {
    const job = longVideoJobs.get(jobId);
    if (!job || job.status !== 'completed') return null;
    return job.videoPath;
}

/**
 * Deletes a job and its video file
 */
async function deleteLongJob(jobId) {
    const job = longVideoJobs.get(jobId);
    if (!job) return false;

    if (job.videoPath) {
        try {
            await fs.unlink(job.videoPath);
        } catch (err) {
            console.error(`Failed to delete video file: ${err.message}`);
        }
    }

    longVideoJobs.delete(jobId);
    return true;
}

/**
 * Determines if a video should use multi-segment generation
 */
function shouldUseMultiSegment(duration) {
    return duration > MULTI_SEGMENT_THRESHOLD;
}

module.exports = {
    createLongVideoJob,
    getLongJobStatus,
    getLongVideoPath,
    deleteLongJob,
    updateLongJobStatus,
    shouldUseMultiSegment,
    MULTI_SEGMENT_THRESHOLD
};
