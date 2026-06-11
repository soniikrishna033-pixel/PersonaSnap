/**
 * Vercel Web Analytics Integration
 * Automatically tracks page views and web vitals
 */

import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject({
  mode: 'auto', // Automatically detect development/production based on environment
  debug: false  // Set to true to enable debug mode in development
});
