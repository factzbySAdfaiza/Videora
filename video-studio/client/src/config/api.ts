// API Configuration
// Set VITE_API_URL in your .env file for production

export const API_URL = import.meta.env.VITE_API_URL || 'videorabackend-production.up.railway.app';

// API endpoints
export const API = {
    generate: `${API_URL}/api/generate`,
    generateAI: `${API_URL}/api/generate-ai`,
    status: (jobId: string) => `${API_URL}/api/status/${jobId}`,
    video: (jobId: string) => `${API_URL}/api/video/${jobId}`,
    examples: `${API_URL}/api/examples`,
    deleteVideo: (jobId: string) => `${API_URL}/api/video/${jobId}`,
};
