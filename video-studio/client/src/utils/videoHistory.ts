// =====================================================
// Video History Management Utilities
// =====================================================

import { VideoHistoryEntry, HistoryQueryOptions, PaginatedResponse } from '../types';

const STORAGE_KEY = 'videoai_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Save a video to history
 */
export function saveToHistory(entry: Omit<VideoHistoryEntry, 'id' | 'createdAt'>): VideoHistoryEntry {
  const history = getHistory();
  
  const newEntry: VideoHistoryEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date()
  };

  history.unshift(newEntry);

  // Keep only the most recent items
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }

  saveHistory(history);
  return newEntry;
}

/**
 * Get all history entries
 */
export function getHistory(): VideoHistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return parsed.map((entry: any) => ({
      ...entry,
      createdAt: new Date(entry.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Get paginated history with filtering and sorting
 */
export function getHistoryPaginated(options: HistoryQueryOptions = {}): PaginatedResponse<VideoHistoryEntry> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    order = 'desc',
    search = '',
    templateId,
    startDate,
    endDate
  } = options;

  let history = getHistory();

  // Filter by search query
  if (search) {
    const lowerSearch = search.toLowerCase();
    history = history.filter(entry =>
      entry.title.toLowerCase().includes(lowerSearch) ||
      entry.prompt?.toLowerCase().includes(lowerSearch) ||
      entry.templateName?.toLowerCase().includes(lowerSearch)
    );
  }

  // Filter by template
  if (templateId) {
    history = history.filter(entry => entry.templateId === templateId);
  }

  // Filter by date range
  if (startDate) {
    history = history.filter(entry => entry.createdAt >= startDate);
  }
  if (endDate) {
    history = history.filter(entry => entry.createdAt <= endDate);
  }

  // Sort
  history.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'duration':
        comparison = a.metadata.duration - b.metadata.duration;
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  // Paginate
  const total = history.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = history.slice(start, start + limit);

  return {
    items,
    total,
    page,
    totalPages,
    limit
  };
}

/**
 * Get a single history entry by ID
 */
export function getHistoryEntry(id: string): VideoHistoryEntry | null {
  const history = getHistory();
  return history.find(entry => entry.id === id) || null;
}

/**
 * Update a history entry
 */
export function updateHistoryEntry(id: string, updates: Partial<VideoHistoryEntry>): boolean {
  const history = getHistory();
  const index = history.findIndex(entry => entry.id === id);
  
  if (index === -1) return false;

  history[index] = { ...history[index], ...updates };
  saveHistory(history);
  return true;
}

/**
 * Delete a history entry
 */
export function deleteHistoryEntry(id: string): boolean {
  const history = getHistory();
  const filtered = history.filter(entry => entry.id !== id);
  
  if (filtered.length === history.length) return false;

  saveHistory(filtered);
  return true;
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get history statistics
 */
export function getHistoryStats() {
  const history = getHistory();
  
  const totalVideos = history.length;
  const totalGenerationTime = history.reduce((sum, entry) => sum + entry.metadata.generationTime, 0);
  const averageDuration = history.length > 0
    ? history.reduce((sum, entry) => sum + entry.metadata.duration, 0) / history.length
    : 0;

  const videosByTemplate: Record<string, number> = {};
  const videosByResolution: Record<string, number> = {};

  history.forEach(entry => {
    if (entry.templateName) {
      videosByTemplate[entry.templateName] = (videosByTemplate[entry.templateName] || 0) + 1;
    }
    
    const resKey = `${entry.metadata.resolution.width}x${entry.metadata.resolution.height}`;
    videosByResolution[resKey] = (videosByResolution[resKey] || 0) + 1;
  });

  const mostUsedTemplate = Object.entries(videosByTemplate).sort((a, b) => b[1] - a[1])[0];

  return {
    totalVideos,
    totalGenerationTime,
    averageDuration,
    videosByTemplate,
    videosByResolution,
    mostUsedTemplate: mostUsedTemplate ? {
      name: mostUsedTemplate[0],
      count: mostUsedTemplate[1]
    } : undefined
  };
}

// Helper functions
function saveHistory(history: VideoHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
