/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repoName = 'shf-calculator'
const prefix = isProd ? `/${repoName}` : ''

const nextConfig = {
  output: 'export',
  basePath: prefix,
  assetPrefix: isProd ? `${prefix}/` : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: prefix
  }
}

module.exports = nextConfig