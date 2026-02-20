/**
 * API Configuration
 * 
 * For development: Uses localhost:5000 by default
 * For production: Set VITE_API_URL environment variable to your backend URL
 * 
 * Example .env file:
 * VITE_API_URL=https://api.yourdomain.com
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  USERS: `${API_BASE_URL}/api/users`,
  INTAKE: `${API_BASE_URL}/api/intake`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  SHORTCUTS: `${API_BASE_URL}/api/shortcuts`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  QUICKBOOKS: {
    AUTH: `${API_BASE_URL}/api/quickbooks/auth`,
    STATUS: `${API_BASE_URL}/api/quickbooks/status`,
    OVERVIEW: `${API_BASE_URL}/api/quickbooks/business-overview`,
  },
} as const;
