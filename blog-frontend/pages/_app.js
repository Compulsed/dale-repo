import { ApolloProvider } from '@apollo/client'
import { DefaultSeo } from 'next-seo'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { WEBSITE_ICON } from '../components/constants'

import client from '../lib/apolloClient'

// CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

const SEO = {
  title: 'Dale Salter Blog',
  description: 'Software Engineering, Leadership, DevOps',
  openGraph: {
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    title: 'Dale Salter Blog',
    description: 'Software Engineering, Leadership, DevOps',
    images: [
      {
        url: WEBSITE_ICON,
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
      <GoogleAnalytics trackPageViews />
      <DefaultSeo {...SEO}></DefaultSeo>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default MyApp
