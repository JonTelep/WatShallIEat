/** @type {import('next').NextConfig} */
const nextConfig = {
  // Restaurant tiles are static files. Keep them out of the server bundle.
  outputFileTracingExcludes: {
    '*': ['./public/places/**'],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'www.watshallieat.com' }],
        destination: 'https://watshallieat.com/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.watshallieat.com' }],
        destination: 'https://watshallieat.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
