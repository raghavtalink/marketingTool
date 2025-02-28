import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/graphql': {
        target: 'https://stagingbackend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})