const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix lockfile root warning when deploying from nested/OneDrive folder
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pictures
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com', // Google Places photos
      },
    ],
  },
}

module.exports = nextConfig
