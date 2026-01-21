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
        hostname: "social-media-belllllx.s3.ap-southeast-7.amazonaws.com",
        pathname: "/post-image/**"
      },
      {
        protocol: "https",
        hostname: "social-media-belllllx.s3.ap-southeast-7.amazonaws.com",
        pathname: "/post-video/**"
      },
      {
        protocol: "https",
        hostname: "social-media-belllllx.s3.ap-southeast-7.amazonaws.com",
        pathname: "/comment-image/**"
      },
    ],
  }
};

export default nextConfig;
