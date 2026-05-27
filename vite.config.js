import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Tailwind v3 는 PostCSS 기반으로 동작 -> 여기 따로 import 불필요.
//   PostCSS 설정은 postcss.config.js 에서 처리.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 개발 중 /api/* 요청을 Flask 백엔드로 전달.
      // 브라우저는 same-origin 으로 인식 -> 세션 쿠키 자연스럽게 전달.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
