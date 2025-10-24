/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '0.0.0.0', 'hole.ethan02.com'],
  },
  // 禁用静态页面生成，使用动态渲染
  output: 'standalone',
}

module.exports = nextConfig