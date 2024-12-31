/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      '14068d66ba387efac9ce5e4b1741bcf2.r2.cloudflarestorage.com',
      'localhost',
      'deansight-ai.s3.us-west-2.amazonaws.com',
      'deansight-ai.s3.amazonaws.com',
      'r2.cloudflarestorage.com'
    ],
    unoptimized: true
  }
}

module.exports = nextConfig 