/** @type {import('next').NextConfig} */
const nextConfig = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "ik.imagekit.io",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
      port: "",
      pathname: "/**",
    },
  ],
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              connect-src 'self' https: wss:;
              font-src 'self' https: data:;
              frame-src 'self' https:;
            `.replace(/\s{2,}/g, " "), // compress spaces
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
