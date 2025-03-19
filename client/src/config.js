const configs = {
  development: {
    apiUrl: 'http://localhost:3000'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://your-vercel-app-url.vercel.app'
  },
  test: {
    apiUrl: 'http://localhost:3000'
  }
}

export const currentConfig = configs[import.meta.env.MODE] || configs.development 

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000' 
