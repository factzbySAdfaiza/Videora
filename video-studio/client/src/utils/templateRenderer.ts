// =====================================================
// Template Rendering Utilities
// =====================================================

import { Template, TemplateParameter } from '../types';

/**
 * Renders a template with provided parameter values
 */
export function renderTemplate(template: Template, parameters: Record<string, any>): string {
  let renderedCode = template.tsxCode;

  // Replace each parameter placeholder with its value
  template.parameters.forEach(param => {
    const value = parameters[param.id] ?? param.defaultValue;
    const placeholder = `{{${param.id}}}`;
    
    // Format value based on type
    let formattedValue: string;
    
    switch (param.type) {
      case 'text':
      case 'color':
      case 'select':
        formattedValue = `'${value}'`;
        break;
      case 'number':
      case 'boolean':
        formattedValue = String(value);
        break;
      default:
        formattedValue = String(value);
    }

    renderedCode = renderedCode.replace(new RegExp(placeholder, 'g'), formattedValue);
  });

  return renderedCode;
}

/**
 * Validates parameter values against their validation rules
 */
export function validateParameters(
  parameters: TemplateParameter[],
  values: Record<string, any>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  parameters.forEach(param => {
    const value = values[param.id];

    // Check if value exists
    if (value === undefined || value === null || value === '') {
      errors[param.id] = `${param.label} is required`;
      return;
    }

    // Type-specific validation
    switch (param.type) {
      case 'text':
        if (typeof value !== 'string') {
          errors[param.id] = `${param.label} must be text`;
        } else if (param.validation) {
          if (param.validation.min && value.length < param.validation.min) {
            errors[param.id] = `${param.label} must be at least ${param.validation.min} characters`;
          }
          if (param.validation.max && value.length > param.validation.max) {
            errors[param.id] = `${param.label} must be at most ${param.validation.max} characters`;
          }
          if (param.validation.pattern && !new RegExp(param.validation.pattern).test(value)) {
            errors[param.id] = `${param.label} format is invalid`;
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors[param.id] = `${param.label} must be a number`;
        } else if (param.validation) {
          if (param.validation.min !== undefined && value < param.validation.min) {
            errors[param.id] = `${param.label} must be at least ${param.validation.min}`;
          }
          if (param.validation.max !== undefined && value > param.validation.max) {
            errors[param.id] = `${param.label} must be at most ${param.validation.max}`;
          }
        }
        break;

      case 'select':
        if (param.validation?.options && !param.validation.options.includes(value)) {
          errors[param.id] = `${param.label} must be one of: ${param.validation.options.join(', ')}`;
        }
        break;

      case 'color':
        if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          errors[param.id] = `${param.label} must be a valid hex color (e.g., #FF0000)`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors[param.id] = `${param.label} must be true or false`;
        }
        break;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Gets default parameter values for a template
 */
export function getDefaultParameters(template: Template): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  template.parameters.forEach(param => {
    defaults[param.id] = param.defaultValue;
  });

  return defaults;
}

/**
 * Estimates video file size based on settings
 */
export function estimateFileSize(
  duration: number,
  width: number,
  height: number,
  _fps: number,
  quality: 'draft' | 'standard' | 'high' | 'ultra'
): number {
  // Bitrate estimates in bits per second
  const bitrates = {
    draft: 2_000_000,
    standard: 5_000_000,
    high: 10_000_000,
    ultra: 20_000_000
  };

  const bitrate = bitrates[quality];
  const pixels = width * height;
  const pixelFactor = pixels / (1920 * 1080); // Normalize to 1080p
  
  // File size in bytes
  return Math.round((bitrate * pixelFactor * duration) / 8);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
