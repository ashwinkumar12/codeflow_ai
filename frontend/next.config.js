/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['indeed.sourcegraph.com'],
    },
    experimental: {
        turbo: {
            rules: {
                // Configure any specific rules for Turbopack
            },
        },
    },
}

module.exports = nextConfig
