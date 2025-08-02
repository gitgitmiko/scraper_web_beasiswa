/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  env: {
    CUSTOM_KEY: 'beasiswa-scraper-web',
  },
}

module.exports = nextConfig 