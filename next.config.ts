import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Minimal configuration for stability
  poweredByHeader: false,
  // Disable source maps in development for Chrome compatibility
  productionBrowserSourceMaps: false,
  // ESLint configuration for build
  eslint: {
    // Re-enabled ESLint in builds after major cleanup
    // Remaining warnings are non-critical (React hooks deps, img elements)
    ignoreDuringBuilds: false,
  },
  // TypeScript configuration for build
  typescript: {
    // TypeScript validation enabled for build
    ignoreBuildErrors: false,
  },
  // Allow large file uploads (500MB for videos)
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Configure allowed quality values for images
    qualities: [75, 80, 90, 95, 100],
  },
  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features and APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // DNS prefetch control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Strict Transport Security (HTTPS only)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Specific headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
        ],
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Disable cache completely to avoid snapshot issues
    config.cache = false;

    // Fix webpack cache warnings in development
    if (dev && !isServer) {
      // Chrome compatibility fixes
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
        },
      };

      // Optimize for Chrome DevTools
      config.optimization = {
        ...config.optimization,
        moduleIds: "named",
        chunkIds: "named",
      };
    }

    // LangChain optimization for production build
    if (!dev && isServer) {
      // Mark LangChain as external for server-side to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push({
        '@langchain/community': 'commonjs @langchain/community',
        '@langchain/core': 'commonjs @langchain/core',
        'langchain': 'commonjs langchain',
      });
    }

    // Optimize build performance
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Split chunks to avoid large bundles
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            langchain: {
              test: /[\\/]node_modules[\\/](@langchain|langchain)[\\/]/,
              name: 'langchain',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
};

export default withNextIntl(nextConfig);
