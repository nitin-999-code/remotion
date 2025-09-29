import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers'],
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files for transformers
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Ignore node-specific modules in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    return config;
  },
  // Ensure static files are properly handled
  trailingSlash: false,
  // Disable image optimization for Vercel compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
