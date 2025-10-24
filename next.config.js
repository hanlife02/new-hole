/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // 禁用静态页面生成，使用动态渲染
  output: 'standalone',
}

module.exports = nextConfig