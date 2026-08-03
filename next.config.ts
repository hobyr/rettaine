import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/actions", destination: "/dashboard", permanent: true },
      { source: "/marketing", destination: "/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
