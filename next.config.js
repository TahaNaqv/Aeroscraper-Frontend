/** @type {import('next').NextConfig} */
//const million = require("million/compiler");
const { env } = require("process");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig = withBundleAnalyzer({
  compiler: {
    removeConsole: env.NODE_ENV === "production" ? true : false,
  },
  compress: true,
  trailingSlash: true,
  experimental: {
    forceSwcTransforms: true,
  },
  swcMinify: true,
});

module.exports = nextConfig;

//module.exports = million.next(nextConfig,{ auto: true });
