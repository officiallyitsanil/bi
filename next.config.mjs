/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://admin.buildersinfo.in/api/:path*',
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'admin.buildersinfo.in',
            },
        ],
    },
};

export default nextConfig;
