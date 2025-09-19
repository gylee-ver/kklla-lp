import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel 빌드 환경에서 이미지 최적화(sharp) 비활성화 → 정적 파일로 서빙
    unoptimized: true,
  },
};

export default nextConfig;
