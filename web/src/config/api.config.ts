/**
 * Centralized API configuration for the Portfolio Automation system.
 * All frontend services should use these constants instead of hardcoded strings.
 */

export const API_CONFIG = {
  // Primary backend server (Server 1)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // Timeout for long-running operations like project creation
  TIMEOUT: 60000, 
  
  // Endpoints
  ENDPOINTS: {
    PROJECTS: {
      LIST: '/projects',
      TEMPLATES: '/projects/templates',
      CREATE: '/projects/create',
      MAKE_LIVE: (id: number) => `/projects/${id}/make-live`,
      FILES: (id: number) => `/projects/${id}/files`,
      FULL_VFS: (id: number) => `/projects/${id}/full-vfs`,
    },
    RESUME: {
      PARSE: '/resume/parse',
      LATEST: '/resume/latest',
    },
    PREVIEW: {
      START: (id: number) => `/preview/${id}/start`,
      STOP: (id: number) => `/preview/${id}/stop`,
      STATUS: (id: number) => `/preview/${id}/status`,
    }
  }
};
