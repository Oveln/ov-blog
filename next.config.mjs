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

    // 实验性功能配置
    experimental: {
        // 启用服务器组件的边缘渲染
        serverExternalPackages: ["@prisma/client"],
    },
};

export default nextConfig;
