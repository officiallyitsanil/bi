import dns from 'dns';
const origLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = { family: 4 };
    } else if (typeof options === 'object' && options) {
        options.family = 4;
    } else {
        options = { family: 4 };
    }
    return origLookup(hostname, options, callback);
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // {
            //     source: '/api/:path*',
            //     destination: 'https://admin.buildersinfo.in/api/:path*',
            // },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
