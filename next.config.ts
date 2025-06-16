import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.*.*', 'localhost', '127.0.0.1'],
  crossOrigin: 'anonymous',
  devIndicators: false
};

export default nextConfig;
