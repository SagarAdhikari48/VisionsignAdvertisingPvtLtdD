//enviroment variable
export const config = {
  supabase: {
    url: "https://vzgjporfwwajxrcimekz.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2pwb3Jmd3dhanhyY2ltZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTkzMjgsImV4cCI6MjA3NTAzNTMyOH0.VkZDlu_mHX6gueoyd6N8HgHV5t34x0weErkpVYk3YU8",
  },

  // Environment detection
  isDevelopment: window.location.hostname === "localhost",
  isProduction: window.location.hostname.includes("visionsign"),

  // Feature flags
  features: {
    enableRealtime: true,
    enableCache: true,
    enableAnalytics: false, // Enable after launch
  },

  // Cache duration (5 minutes)
  cacheDuration: 5 * 60 * 1000,

  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,
};
