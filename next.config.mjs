/** @type {import("next").NextConfig} */
const nextConfig = {
    // Docker 优化配置
    output: "standalone",

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "note.oveln.icu",
            },
            {
                protocol: "https",
                hostname: "pic.oveln.icu",
            },
        ],
        minimumCacheTTL: 15000000,
    },

    // 服务器外部包配置（已从 experimental 移出）
    serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
