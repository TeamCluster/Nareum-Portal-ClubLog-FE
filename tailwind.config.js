/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind 가 유틸리티 클래스 사용처를 찾을 경로.
  // 여기 빠지면 본 적 없는 클래스로 간주되어 빌드에서 제거됨.
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // Pretendard 를 기본 sans 로 -> 모든 텍스트가 자동으로 적용.
      // (CDN 로딩은 index.html 에서)
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      // 색상/간격 등 디자인 토큰은 페이지 만들면서 필요한 만큼 추가.
    },
  },
  plugins: [],
}
