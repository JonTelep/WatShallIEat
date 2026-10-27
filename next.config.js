/** @type {import('next').NextConfig} */
const nextConfig = {
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
