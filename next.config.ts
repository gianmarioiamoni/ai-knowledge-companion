import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack cache in development to avoid cache warnings
      config.cache = false;
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
