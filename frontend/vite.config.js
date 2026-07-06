// vite.config.js
// -----------------------------------------------------------------------------
// Vite is the build tool that bundles and serves our React app.
// - During development: `npm run dev` starts a fast local server with hot reload.
// - For production:     `npm run build` outputs optimized static files to /dist,
//   which is exactly what Vercel serves when we deploy.
// -----------------------------------------------------------------------------
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The React plugin enables JSX compilation and Fast Refresh (instant UI
  // updates in the browser while you edit code).
  plugins: [react()],

  server: {
    // DEV PROXY: when the React app (port 5173) calls fetch('/api/...'),
    // Vite forwards the request to the Flask backend on port 5000.
    // This avoids CORS headaches and means the frontend code can use the
    // same relative '/api' path in development AND in production (Vercel).
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
