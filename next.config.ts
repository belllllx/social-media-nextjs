import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "social-media-belllllx.58edcdd48b5a4b1ba836c243e002e57f.r2.cloudflarestorage.com",
        pathname: "/post-image/**"
      },
      {
        protocol: "https",
        hostname: "social-media-belllllx.58edcdd48b5a4b1ba836c243e002e57f.r2.cloudflarestorage.com",
        pathname: "/post-video/**"
      },
      {
        protocol: "https",
        hostname: "social-media-belllllx.58edcdd48b5a4b1ba836c243e002e57f.r2.cloudflarestorage.com",
        pathname: "/comment-image/**"
      },
    ],
  }
};

export default nextConfig;
