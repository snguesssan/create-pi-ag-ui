import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pi SDK and its dependencies use native Node.js modules
  serverExternalPackages: [
    "@mariozechner/pi-coding-agent",
    "@mariozechner/pi-ai",
    "@mariozechner/pi-agent-core",
  ],
};

export default nextConfig;
