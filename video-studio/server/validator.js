// Input validator for video generation requests
const fs = require('fs');
const path = require('path');

/**
 * Validates TSX code for security and correctness
 */
function validateTsxCode(code) {
  const errors = [];

  if (!code || typeof code !== 'string') {
    errors.push('TSX code is required and must be a string');
    return { valid: false, errors };
  }

  // Check for required export
  if (!code.includes('export const MyVideo')) {
    errors.push('Code must export a component named "MyVideo"');
  }

  // Check for dangerous patterns
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

  // Check for allowed imports only
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/gi;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importSource = match[1];
    if (!['react', 'remotion'].includes(importSource)) {
      errors.push(`Unauthorized import detected: ${importSource}. Only 'react' and 'remotion' are allowed.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates video configuration parameters
 * Supports extended duration for multi-segment videos
 */
function validateVideoConfig(config) {
  const errors = [];
  const defaults = {
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080,
  };

  // Extended duration support (up to 5 minutes for multi-segment)
  if (config.duration && (typeof config.duration !== 'number' || config.duration < 1 || config.duration > 300)) {
    errors.push('Duration must be a number between 1 and 300 seconds (5 minutes)');
  }

  // Extended FPS options
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

/**
 * Validates text prompt for AI generation
 */
function validatePrompt(prompt) {
  const errors = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
    return { valid: false, errors };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < 5) {
    errors.push('Prompt must be at least 5 characters long');
  }

  if (trimmed.length > 1000) {
    errors.push('Prompt must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateTsxCode,
  validateVideoConfig,
  validatePrompt,
};
