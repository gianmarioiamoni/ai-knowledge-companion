import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Minimal configuration for stability
  poweredByHeader: false,
  // Disable source maps in development for Chrome compatibility
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    // Fix webpack cache warnings in development
    if (dev && !isServer) {
      config.cache = {
        type: "memory",
      };

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
    return config;
  },
};

export default withNextIntl(nextConfig);
