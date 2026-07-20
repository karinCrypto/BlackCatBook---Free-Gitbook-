import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/notes', destination: '/notes/index.html' },
      { source: '/notes/', destination: '/notes/index.html' },
    ]
  },
};

export default nextConfig;
