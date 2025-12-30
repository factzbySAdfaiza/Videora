// Vercel Serverless Function for video generation
const { validateTsxCode, validateVideoConfig } = require('../server/validator');
const { createJob } = require('../server/videoGenerator');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { tsxCode, config } = req.body;

        const tsxValidation = validateTsxCode(tsxCode);
        if (!tsxValidation.valid) {
            return res.status(400).json({
                error: 'Invalid TSX code',
                details: tsxValidation.errors,
            });
        }

        const configValidation = validateVideoConfig(config || {});
        if (!configValidation.valid) {
            return res.status(400).json({
                error: 'Invalid video configuration',
                details: configValidation.errors,
            });
        }

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
};
