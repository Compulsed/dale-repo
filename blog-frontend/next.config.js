/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // https://www.stackfive.io/work/nextjs/how-to-fix-styled-components-page-flicker-in-next-js-12
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/post/8afd46ad-7da2-4b2a-9cb5-9e5ae4fe6cc2',
        destination: '/post/8afd46ad-7da2-4b2a-9cb5-9e5ae4fe6cc2/cdk-lambda-otel-honeycomb',
        permanent: true,
      },
      {
        source: '/post/153c962c-1196-4249-a2e5-700885cc055c',
        destination: '/post/153c962c-1196-4249-a2e5-700885cc055c/podcast-yan-cui',
        permanent: true,
      },
      {
        source: '/post/4ec7974b-237e-454f-931a-d2174eb4394c',
        destination: '/post/4ec7974b-237e-454f-931a-d2174eb4394c/serverless-days-sydney-2019',
        permanent: true,
      },
      {
        source: '/post/d3fc9dc6-4484-49cd-815e-8e7ae2f878dd',
        destination: '/post/d3fc9dc6-4484-49cd-815e-8e7ae2f878dd/what-is-serverless',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
