/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/shf-calculator' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/shf-calculator/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig