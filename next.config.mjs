/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: "standalone",
  env: {
    CHRONOCRAFT_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
