/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // https://www.stackfive.io/work/nextjs/how-to-fix-styled-components-page-flicker-in-next-js-12
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig
