import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available in the client-side code
    'process.env': process.env
  },
  server: {
    // For development, you might need to host on all interfaces
    // to access it from a mobile device on the same network
    host: '0.0.0.0',
    port: 5173
  }
})
