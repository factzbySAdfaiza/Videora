// Input validator for video generation requests

function validateTsxCode(code) {
    const errors = [];

    if (!code || typeof code !== 'string') {
        errors.push('TSX code is required and must be a string');
        return { valid: false, errors };
    }

    if (!code.includes('export const MyVideo')) {
        errors.push('Code must export a component named "MyVideo"');
    }

    const dangerousPatterns = [
        /require\s*\(/gi,
        /import\s+.*\s+from\s+['"][^remotion|react]/gi,
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /XMLHttpRequest/gi,
        /fetch\s*\(/gi,
        /__dirname/gi,
        /__filename/gi,
        /process\./gi,
        /child_process/gi,
        /fs\./gi,
    ];

    dangerousPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
            errors.push(`Potentially dangerous code detected: ${pattern.toString()}`);
        }
    });

    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/gi;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
        const importSource = match[1];
        if (!['react', 'remotion'].includes(importSource)) {
            errors.push(`Unauthorized import: ${importSource}. Only 'react' and 'remotion' allowed.`);
        }
    }

    return { valid: errors.length === 0, errors };
}

function validateVideoConfig(config) {
    const errors = [];
    const defaults = { duration: 5, fps: 30, width: 1920, height: 1080 };

    if (config.duration && (typeof config.duration !== 'number' || config.duration < 1 || config.duration > 60)) {
        errors.push('Duration must be between 1 and 60 seconds');
    }

    if (config.fps && (typeof config.fps !== 'number' || ![24, 25, 30, 50, 60].includes(config.fps))) {
        errors.push('FPS must be 24, 25, 30, 50, or 60');
    }

    if (config.width && (typeof config.width !== 'number' || config.width < 100 || config.width > 3840)) {
        errors.push('Width must be between 100 and 3840 pixels');
    }

    if (config.height && (typeof config.height !== 'number' || config.height < 100 || config.height > 2160)) {
        errors.push('Height must be between 100 and 2160 pixels');
    }

    return {
        valid: errors.length === 0,
        errors,
        config: {
            duration: config.duration || defaults.duration,
            fps: config.fps || defaults.fps,
            width: config.width || defaults.width,
            height: config.height || defaults.height,
        },
    };
}

function validatePrompt(prompt) {
    const errors = [];

    if (!prompt || typeof prompt !== 'string') {
        errors.push('Prompt is required');
        return { valid: false, errors };
    }

    const trimmed = prompt.trim();
    if (trimmed.length < 5) errors.push('Prompt must be at least 5 characters');
    if (trimmed.length > 1000) errors.push('Prompt must be less than 1000 characters');

    return { valid: errors.length === 0, errors };
}

module.exports = { validateTsxCode, validateVideoConfig, validatePrompt };
