/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jubutech/shared"],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // public/design-system/index.html 을 /design-system 경로로 서빙
  async rewrites() {
    return [
      { source: "/design-system", destination: "/design-system/index.html" },
      { source: "/design-system/", destination: "/design-system/index.html" },
    ];
  },
};
export default nextConfig;
