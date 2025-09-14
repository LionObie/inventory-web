/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  turbopack: { root: __dirname }, // optional, silences wrong-root warning
}

module.exports = nextConfig
