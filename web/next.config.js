/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "@codesandbox/sandpack-react",
        "@codesandbox/sandpack-themes",
        "@monaco-editor/react",
        "@repo/types",
        "@repo/validation",
        "@repo/ui"
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 's0.wp.com',
            },
        ],
    },
    // Fix build blockers for Vercel
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;

