import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "cdn.example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/categories",
        destination: "http://localhost:4001/api/v1/categories",
      },
      {
        source: "/api/v1/categories/:path*",
        destination: "http://localhost:4001/api/v1/categories/:path*",
      },
      {
        source: "/api/v1/products",
        destination: "http://localhost:4001/api/v1/products",
      },
      {
        source: "/api/v1/products/:path*",
        destination: "http://localhost:4001/api/v1/products/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:4000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
