// =====================================================
// Video Settings Constants
// =====================================================

import { Resolution, AspectRatio, QualityPreset, PlatformPreset, VideoSettings } from '../types';

// Resolution Presets
// =====================================================

export const RESOLUTION_PRESETS: Resolution[] = [
  {
    name: '480p',
    width: 854,
    height: 480,
    label: 'SD (480p)'
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    label: 'HD (720p)'
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    label: 'Full HD (1080p)'
  },
  {
    name: '1440p',
    width: 2560,
    height: 1440,
    label: 'QHD (1440p)'
  },
  {
    name: '4K',
    width: 3840,
    height: 2160,
    label: '4K UHD'
  }
];

// FPS Options
// =====================================================

export const FPS_OPTIONS = [24, 25, 30, 50, 60] as const;

export type FPSOption = typeof FPS_OPTIONS[number];

// Duration Constraints (extended for multi-segment)
// =====================================================

export const DURATION_MIN = 1;
export const DURATION_MAX = 300; // 5 minutes max
export const DURATION_DEFAULT = 5;
export const MULTI_SEGMENT_THRESHOLD = 15; // Videos > 15s use multi-segment

// Resolution Constraints
// =====================================================

export const WIDTH_MIN = 100;
export const WIDTH_MAX = 3840;
export const HEIGHT_MIN = 100;
export const HEIGHT_MAX = 2160;

// Aspect Ratio Presets
// =====================================================

export const ASPECT_RATIO_PRESETS = [
  { ratio: AspectRatio.LANDSCAPE_16_9, label: '16:9 (Landscape)', width: 16, height: 9 },
  { ratio: AspectRatio.PORTRAIT_9_16, label: '9:16 (Portrait)', width: 9, height: 16 },
  { ratio: AspectRatio.SQUARE_1_1, label: '1:1 (Square)', width: 1, height: 1 },
  { ratio: AspectRatio.CLASSIC_4_3, label: '4:3 (Classic)', width: 4, height: 3 },
  { ratio: AspectRatio.ULTRAWIDE_21_9, label: '21:9 (Ultrawide)', width: 21, height: 9 }
];

// Quality Presets
// =====================================================

export const QUALITY_PRESET_CONFIGS: Record<QualityPreset, Partial<VideoSettings>> = {
  [QualityPreset.DRAFT]: {
    resolution: RESOLUTION_PRESETS[1], // 720p
    fps: 24,
    quality: QualityPreset.DRAFT
  },
  [QualityPreset.STANDARD]: {
    resolution: RESOLUTION_PRESETS[2], // 1080p
    fps: 30,
    quality: QualityPreset.STANDARD
  },
  [QualityPreset.HIGH]: {
    resolution: RESOLUTION_PRESETS[2], // 1080p
    fps: 60,
    quality: QualityPreset.HIGH
  },
  [QualityPreset.ULTRA]: {
    resolution: RESOLUTION_PRESETS[4], // 4K
    fps: 60,
    quality: QualityPreset.ULTRA
  }
};

// Platform Presets
// =====================================================

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    name: 'YouTube',
    platform: 'youtube',
    icon: '📺',
    settings: {
      resolution: { name: '1080p', width: 1920, height: 1080, label: 'Full HD (1080p)' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.LANDSCAPE_16_9,
      quality: QualityPreset.STANDARD
    }
  },
  {
    name: 'Instagram Story',
    platform: 'instagram',
    icon: '📱',
    settings: {
      resolution: { name: '1080x1920', width: 1080, height: 1920, label: 'Instagram Story' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.PORTRAIT_9_16,
      quality: QualityPreset.STANDARD
    }
  },
  {
    name: 'Instagram Post',
    platform: 'instagram',
    icon: '📷',
    settings: {
      resolution: { name: '1080x1080', width: 1080, height: 1080, label: 'Instagram Square' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.SQUARE_1_1,
      quality: QualityPreset.STANDARD
    }
  },
  {
    name: 'TikTok',
    platform: 'tiktok',
    icon: '🎵',
    settings: {
      resolution: { name: '1080x1920', width: 1080, height: 1920, label: 'TikTok' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.PORTRAIT_9_16,
      quality: QualityPreset.STANDARD
    }
  },
  {
    name: 'Twitter',
    platform: 'twitter',
    icon: '🐦',
    settings: {
      resolution: { name: '1280x720', width: 1280, height: 720, label: 'HD (720p)' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.LANDSCAPE_16_9,
      quality: QualityPreset.STANDARD
    }
  },
  {
    name: 'Facebook',
    platform: 'facebook',
    icon: '👥',
    settings: {
      resolution: { name: '1280x720', width: 1280, height: 720, label: 'HD (720p)' },
      fps: 30,
      duration: 5,
      aspectRatio: AspectRatio.LANDSCAPE_16_9,
      quality: QualityPreset.STANDARD
    }
  }
];

// Default Settings
// =====================================================

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  resolution: RESOLUTION_PRESETS[2], // 1080p
  fps: 30,
  duration: 5,
  aspectRatio: AspectRatio.LANDSCAPE_16_9,
  quality: QualityPreset.STANDARD
};

// File Size Estimation Constants
// =====================================================

// Approximate bitrate in bits per second for different quality levels
export const BITRATE_ESTIMATES: Record<QualityPreset, number> = {
  [QualityPreset.DRAFT]: 2_000_000, // 2 Mbps
  [QualityPreset.STANDARD]: 5_000_000, // 5 Mbps
  [QualityPreset.HIGH]: 10_000_000, // 10 Mbps
  [QualityPreset.ULTRA]: 20_000_000 // 20 Mbps
};

// Generation Time Estimation Constants (milliseconds per frame)
// =====================================================

export const GENERATION_TIME_PER_FRAME: Record<QualityPreset, number> = {
  [QualityPreset.DRAFT]: 50,
  [QualityPreset.STANDARD]: 100,
  [QualityPreset.HIGH]: 150,
  [QualityPreset.ULTRA]: 300
};
