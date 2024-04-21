// eslint-disable-next-line @typescript-eslint/no-var-requires
/** @type {function(import("next").NextConfig): import("next").NextConfig}} */
import removeImports from "next-remove-imports";
const removeImportsFun = removeImports({
    // test: /node_modules([\s\S]*?)\.(tsx|ts|js|mjs|jsx)$/,
    // matchImports: "\\.(less|css|scss|sass|styl)$"
});
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

export default nextConfig
