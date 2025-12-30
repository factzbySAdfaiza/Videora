// =====================================================
// Core Type Definitions for Video Studio
// =====================================================

// Template System Types
// =====================================================

export enum TemplateCategory {
  SOCIAL_MEDIA = 'social-media',
  MARKETING = 'marketing',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  BUSINESS = 'business',
  PERSONAL = 'personal'
}

export type ParameterType = 'text' | 'color' | 'number' | 'select' | 'boolean';

export interface TemplateParameter {
  id: string;
  name: string;
  label: string;
  type: ParameterType;
  defaultValue: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  description: string;
}

export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  previewUrl: string;
  thumbnailUrl: string;
  tsxCode: string;
  parameters: TemplateParameter[];
  tags: string[];
  difficulty: TemplateDifficulty;
  estimatedDuration: number; // seconds
  createdAt: Date;
  updatedAt: Date;
}

// Video Settings Types
// =====================================================

export enum AspectRatio {
  LANDSCAPE_16_9 = '16:9',
  PORTRAIT_9_16 = '9:16',
  SQUARE_1_1 = '1:1',
  CLASSIC_4_3 = '4:3',
  ULTRAWIDE_21_9 = '21:9'
}

export enum QualityPreset {
  DRAFT = 'draft',
  STANDARD = 'standard',
  HIGH = 'high',
  ULTRA = 'ultra'
}

export interface Resolution {
  name: string;
  width: number;
  height: number;
  label: string; // e.g., "1080p", "4K"
}

export interface VideoSettings {
  resolution: Resolution;
  fps: number;
  duration: number;
  aspectRatio: AspectRatio;
  quality: QualityPreset;
  customSettings?: {
    width?: number;
    height?: number;
  };
}

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook';

export interface PlatformPreset {
  name: string;
  platform: PlatformType;
  settings: VideoSettings;
  icon: string;
}

// Video History Types
// =====================================================

export type VideoStatus = 'available' | 'unavailable' | 'processing';

export interface VideoMetadata {
  fileSize: number; // bytes
  duration: number; // seconds
  resolution: { width: number; height: number };
  fps: number;
  format: string;
  generationTime: number; // milliseconds
  isMultiSegment?: boolean;
  segmentCount?: number;
}

export interface VideoHistoryEntry {
  id: string;
  userId: string;
  title: string;
  prompt?: string;
  templateId?: string;
  templateName?: string;
  videoUrl: string;
  thumbnailUrl: string;
  settings: VideoSettings;
  metadata: VideoMetadata;
  status: VideoStatus;
  createdAt: Date;
  batchId?: string;
}

// Share Link Types
// =====================================================

export interface ShareLink {
  token: string;
  videoId: string;
  shareUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

// Batch Generation Types
// =====================================================

export interface BatchJob {
  id: string;
  templateId: string;
  parameterSets: Record<string, any>[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

// Analytics Types
// =====================================================

export interface AnalyticsData {
  totalVideos: number;
  totalGenerationTime: number; // milliseconds
  averageDuration: number; // seconds
  videosByTemplate: Record<string, number>;
  videosByResolution: Record<string, number>;
  videosByTimePeriod: Record<string, number>;
  mostUsedTemplate?: {
    id: string;
    name: string;
    count: number;
  };
}

// API Response Types
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Validation Types
// =====================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Query Options Types
// =====================================================

export interface HistoryQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title' | 'duration';
  order?: 'asc' | 'desc';
  search?: string;
  templateId?: string;
  startDate?: Date;
  endDate?: Date;
}
