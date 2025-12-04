const path = require('path');
const dotenv = require('dotenv');

// Load .env from root directory
const envConfig = dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Extract environment variables
const env = envConfig.parsed || {};

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost', '192.168.1.140'],
    },
    // Inject environment variables into Next.js
    env: {
        NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BACKEND_URL: env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL,
        NEXT_PUBLIC_FRONTEND_URL: env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
