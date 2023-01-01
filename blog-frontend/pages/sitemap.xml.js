import React from 'react'
import { request, gql } from 'graphql-request'

// e.g. https://dalejsalter.com
const ROOT_URL = process.env.NEXT_PUBLIC_VERCEL_URL

const GET_POSTS = gql`
  query {
    posts {
      id
      urlStub
      createdAt
    }
  }
`

const lastModifiedDate = ({ posts }) => {
  return new Date(posts.sort((a, b) => a.createdAt < b.createdAt)[0].createdAt).toISOString()
}

const createSitemap = ({ posts }) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${ROOT_URL}</loc>
            <changefreq>weekly</changefreq>
            <lastmod>${lastModifiedDate({ posts })}</lastmod>
            <priority>1.00</priority>
        </url>
        <url>
          <loc>${`${ROOT_URL}/about`}</loc>
        </url>
        ${posts
          .map((post) => {
            return `
                    <url>
                        <loc>${`${ROOT_URL}/post/${post.id}/${post.urlStub}`}</loc>
                    </url>
                `
          })
          .join('')}
    </urlset>
`

class Sitemap extends React.Component {
  static async getInitialProps({ res }) {
    // TODO Use apollo client
    const postData = await request(process.env.NEXT_PUBLIC_API_URL, GET_POSTS)

    const siteMap = {
      posts: (postData && postData.posts) || [],
    }

    res.setHeader('Content-Type', 'text/xml')
    res.write(createSitemap(siteMap))
    res.end()
  }
}

export default Sitemap
