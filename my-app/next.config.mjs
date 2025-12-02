/** @type {import('next').NextConfig} */
const nextConfig = {
    // async rewrites() {
    //     return [
    //         {
    //             source: '/socket.io/:path*',
    //             destination: 'http://localhost:4001/socket.io/:path*', // Replace with your socket server URL
    //         },
    //     ];
    // },
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        config.externals.push('pino-pretty', /* add any other modules that might be causing the error */);
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
    images: {
        domains: ['lh3.googleusercontent.com', 'i.seadn.io', 'openseauserdata.com'],
    },
    // async headers() {
    //     return [
    //         {
    //             source: '/(.*)',
    //             headers: [
    //                 {
    //                     key: 'X-Content-Type-Options',
    //                     value: 'nosniff',
    //                 },
    //                 {
    //                     key: 'X-Frame-Options',
    //                     value: 'DENY',
    //                 },
    //                 {
    //                     key: 'Referrer-Policy',
    //                     value: 'strict-origin-when-cross-origin',
    //                 },
    //             ],
    //         },
    //         {
    //             source: '/sw.js',
    //             headers: [
    //                 {
    //                     key: 'Content-Type',
    //                     value: 'application/javascript; charset=utf-8',
    //                 },
    //                 {
    //                     key: 'Cache-Control',
    //                     value: 'no-cache, no-store, must-revalidate',
    //                 },
    //                 {
    //                     key: 'Content-Security-Policy',
    //                     value: "default-src 'self'; script-src 'self'",
    //                 },
    //             ],
    //         },
    //     ]
    // },
};

export default nextConfig;
