// =====================================================
// Validation Utilities
// =====================================================

import {
  Template,
  TemplateParameter,
  VideoSettings,
  VideoHistoryEntry,
  ValidationResult
} from '../types';
import {
  WIDTH_MIN,
  WIDTH_MAX,
  HEIGHT_MIN,
  HEIGHT_MAX,
  DURATION_MIN,
  DURATION_MAX,
  FPS_OPTIONS
} from '../constants/videoSettings';

// Template Validation
// =====================================================

export function validateTemplate(template: Partial<Template>): ValidationResult {
  const errors: string[] = [];

  if (!template.id || template.id.trim() === '') {
    errors.push('Template ID is required');
  }

  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  }

  if (!template.description || template.description.trim() === '') {
    errors.push('Template description is required');
  }

  if (!template.category) {
    errors.push('Template category is required');
  }

  if (!template.tsxCode || template.tsxCode.trim() === '') {
    errors.push('Template TSX code is required');
  }

  if (!template.parameters || !Array.isArray(template.parameters)) {
    errors.push('Template parameters must be an array');
  }

  if (!template.previewUrl || template.previewUrl.trim() === '') {
    errors.push('Template preview URL is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateTemplateParameter(param: Partial<TemplateParameter>): ValidationResult {
  const errors: string[] = [];

  if (!param.id || param.id.trim() === '') {
    errors.push('Parameter ID is required');
  }

  if (!param.name || param.name.trim() === '') {
    errors.push('Parameter name is required');
  }

  if (!param.label || param.label.trim() === '') {
    errors.push('Parameter label is required');
  }

  if (!param.type) {
    errors.push('Parameter type is required');
  }

  if (param.defaultValue === undefined || param.defaultValue === null) {
    errors.push('Parameter default value is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Video Settings Validation
// =====================================================

export function validateVideoSettings(settings: Partial<VideoSettings>): ValidationResult {
  const errors: string[] = [];

  // Validate resolution
  if (!settings.resolution) {
    errors.push('Resolution is required');
  } else {
    const { width, height } = settings.resolution;

    if (width < WIDTH_MIN || width > WIDTH_MAX) {
      errors.push(`Width must be between ${WIDTH_MIN} and ${WIDTH_MAX} pixels`);
    }

    if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
      errors.push(`Height must be between ${HEIGHT_MIN} and ${HEIGHT_MAX} pixels`);
    }
  }

  // Validate FPS
  if (!settings.fps) {
    errors.push('FPS is required');
  } else if (!FPS_OPTIONS.includes(settings.fps as any)) {
    errors.push(`FPS must be one of: ${FPS_OPTIONS.join(', ')}`);
  }

  // Validate duration
  if (!settings.duration) {
    errors.push('Duration is required');
  } else if (settings.duration < DURATION_MIN || settings.duration > DURATION_MAX) {
    errors.push(`Duration must be between ${DURATION_MIN} and ${DURATION_MAX} seconds`);
  }

  // Validate aspect ratio
  if (!settings.aspectRatio) {
    errors.push('Aspect ratio is required');
  }

  // Validate quality
  if (!settings.quality) {
    errors.push('Quality preset is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateResolution(width: number, height: number): ValidationResult {
  const errors: string[] = [];

  if (width < WIDTH_MIN || width > WIDTH_MAX) {
    errors.push(`Width must be between ${WIDTH_MIN} and ${WIDTH_MAX} pixels`);
  }

  if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
    errors.push(`Height must be between ${HEIGHT_MIN} and ${HEIGHT_MAX} pixels`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateDuration(duration: number): ValidationResult {
  const errors: string[] = [];

  if (duration < DURATION_MIN || duration > DURATION_MAX) {
    errors.push(`Duration must be between ${DURATION_MIN} and ${DURATION_MAX} seconds`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateFPS(fps: number): ValidationResult {
  const errors: string[] = [];

  if (!FPS_OPTIONS.includes(fps as any)) {
    errors.push(`FPS must be one of: ${FPS_OPTIONS.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// History Entry Validation
// =====================================================

export function validateHistoryEntry(entry: Partial<VideoHistoryEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.id || entry.id.trim() === '') {
    errors.push('History entry ID is required');
  }

  if (!entry.userId || entry.userId.trim() === '') {
    errors.push('User ID is required');
  }

  if (!entry.title || entry.title.trim() === '') {
    errors.push('Video title is required');
  }

  if (!entry.videoUrl || entry.videoUrl.trim() === '') {
    errors.push('Video URL is required');
  }

  if (!entry.settings) {
    errors.push('Video settings are required');
  }

  if (!entry.metadata) {
    errors.push('Video metadata is required');
  }

  if (!entry.createdAt) {
    errors.push('Creation date is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Parameter Value Validation
// =====================================================

export function validateParameterValue(
  param: TemplateParameter,
  value: any
): ValidationResult {
  const errors: string[] = [];

  // Type validation
  switch (param.type) {
    case 'text':
      if (typeof value !== 'string') {
        errors.push(`${param.label} must be a string`);
      } else if (param.validation) {
        if (param.validation.min && value.length < param.validation.min) {
          errors.push(`${param.label} must be at least ${param.validation.min} characters`);
        }
        if (param.validation.max && value.length > param.validation.max) {
          errors.push(`${param.label} must be at most ${param.validation.max} characters`);
        }
        if (param.validation.pattern) {
          const regex = new RegExp(param.validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${param.label} format is invalid`);
          }
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${param.label} must be a number`);
      } else if (param.validation) {
        if (param.validation.min !== undefined && value < param.validation.min) {
          errors.push(`${param.label} must be at least ${param.validation.min}`);
        }
        if (param.validation.max !== undefined && value > param.validation.max) {
          errors.push(`${param.label} must be at most ${param.validation.max}`);
        }
      }
      break;

    case 'color':
      if (typeof value !== 'string') {
        errors.push(`${param.label} must be a string`);
      } else if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
        errors.push(`${param.label} must be a valid hex color (e.g., #FF0000)`);
      }
      break;

    case 'select':
      if (param.validation?.options && !param.validation.options.includes(value)) {
        errors.push(`${param.label} must be one of: ${param.validation.options.join(', ')}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${param.label} must be a boolean`);
      }
      break;

    default:
      errors.push(`Unknown parameter type: ${param.type}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
