/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ik.imagekit.io', 'avatars.githubusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // apply to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              connect-src 'self' https: wss:;
              font-src 'self' https: data:;
              frame-src 'self' https:;
            `.replace(/\s{2,}/g, ' '), // compress spaces
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig