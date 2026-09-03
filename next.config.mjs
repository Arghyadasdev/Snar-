/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
