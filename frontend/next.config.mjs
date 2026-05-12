const internalApiBaseUrl = (process.env.INTERNAL_API_BASE_URL || "http://backend:8000").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApiBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
