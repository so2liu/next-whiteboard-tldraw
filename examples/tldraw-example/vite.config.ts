import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
	host: '0.0.0.0',
	port: 5420,
	proxy: {
		'/api': {
			target: 'http://127.0.0.1:8000',
			changeOrigin: true,
			rewrite: (url) => url.replace(/^\/api/, ''),
		}
	},
},
})
