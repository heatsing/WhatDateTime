/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: "standalone",
  env: {
    CHRONOCRAFT_BUILD_TIME: "2026-01-01T12:00:00.000Z",
  },
};

export default nextConfig;
