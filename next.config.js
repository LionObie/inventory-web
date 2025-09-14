/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  turbopack: { root: __dirname },
  async redirects() {
    return [
      { source: '/apple-touch-icon.png', destination: '/favicon.ico', permanent: false },
      { source: '/apple-touch-icon-precomposed.png', destination: '/favicon.ico', permanent: false },
    ]
  },
}
module.exports = nextConfig
