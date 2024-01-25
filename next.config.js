/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "note.oveln.icu"
            }
        ],
        minimumCacheTTL: 15000000
    }
};

module.exports= nextConfig;