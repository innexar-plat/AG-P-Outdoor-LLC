/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/admin",
  assetPrefix: "/admin/",
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["@libsql/client", "better-auth"],
  },
  webpack: (config) => {
    config.module.rules.unshift(
      { test: /\.md$/, type: "asset/source" },
      { test: /LICENSE$/i, type: "asset/source" }
    );
    return config;
  },
};

export default nextConfig;
