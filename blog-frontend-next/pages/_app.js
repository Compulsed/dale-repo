import { ApolloProvider } from '@apollo/client'
import { DefaultSeo } from 'next-seo'

import client from '../lib/apolloClient'

// CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

const SEO = {
  title: 'Dale Salter Blog',
  description: 'Serverless, Software Engineering, Leadership, DevOps',
  openGraph: {
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    title: 'Dale Salter Blog',
    description: 'Serverless, Software Engineering, Leadership, DevOps',
    images: [
      {
        url: 'https://blog-production-image-bucket.s3-accelerate.amazonaws.com/logo-4.png',
        width: 800,
        height: 800,
        alt: 'Blog Artwork',
        type: 'image/png',
      },
    ],
    siteName: 'Dale Salter Blog',
  },
  twitter: {
    handle: '@enepture',
    site: '@enepture',
    cardType: 'summary_large_image',
  },
}

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <DefaultSeo {...SEO}></DefaultSeo>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default MyApp
