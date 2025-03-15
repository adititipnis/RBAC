const config = {
  development: {
    apiUrl: 'http://localhost:3000'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.yoursite.com'
  },
  test: {
    apiUrl: 'http://localhost:3000'
  }
}

const environment = import.meta.env.MODE || 'development'
export const currentConfig = config[environment] 
