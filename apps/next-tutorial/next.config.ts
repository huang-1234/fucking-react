import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: true, // 启用Turbopack加速开发
    mdxRs: true, // 启用Rust版MDX解析器
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.vercel.app'
    }]
  },
  transpilePackages: ['react-syntax-highlighter'] // 优化打包
};

export default nextConfig;