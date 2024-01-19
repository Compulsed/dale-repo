import Head from 'next/head'

import { Container, Row, Col } from 'react-bootstrap'
import { NextSeo } from 'next-seo'

import { Header } from '../components/layout/header'
import { Footer } from '../components/layout/footer'
import { PostCard } from '../components/card'
import { SearchHeader } from '../components/search-header'

const POSTS_QUERY = `
  query QueryPosts {
    tags {
      id
      name
      posts {
        id
      }
    }
    posts {
      id
      title
      shortDescription
      urlStub
      longDescription
      imageUrl
      body
      createdAt
      updatedAt
      tags {
        id
        name
      }
    }
  }
`

export async function getStaticProps() {
  // TODO Use apollo client
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: POSTS_QUERY, variables: {} }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  return {
    props: { posts: data.data.posts, tags: data.data.tags },
    revalidate: 10,
  }
}

export default function Home({ posts, tags }) {
  return (
    <div>
      <Head>
        <link
          rel="icon"
          href="https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/99779162-8819-4754-b45f-587784684e44-logo-4.png"
        />
      </Head>

      <main>
        <NextSeo
          title="Dale Salter's Blog"
          description="My blog focuses on the following topics, Serverless, Software Engineering, Leadership, DevOps"
          canonical={`${process.env.NEXT_PUBLIC_VERCEL_URL}`}
          openGraph={{
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_VERCEL_URL}`,
            title: "Dale Salter's Blog",
            description:
              'My blog focuses on the following topics, Serverless, Software Engineering, Leadership, DevOps',
            images: [
              {
                url: 'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/99779162-8819-4754-b45f-587784684e44-logo-4.png',
                width: 800,
                height: 800,
                alt: 'Og Blog Artwork',
                type: 'image/png',
              },
            ],
            siteName: 'Dale Salter - Blog',
          }}
          twitter={{
            handle: '@enepture',
            site: '@enepture',
            title: "Dale Salter's Blog",
            description:
              'My blog focuses on the following topics, Serverless, Software Engineering, Leadership, DevOps',
            image:
              'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/99779162-8819-4754-b45f-587784684e44-logo-4.png',
            cardType: 'summary_large_image',
          }}
        />

        <Header />

        <SearchHeader tags={tags} />

        <Container>
          {(posts || []).map((post) => {
            return (
              <Row key={post.id}>
                <Col style={{ padding: 10 }}>
                  <PostCard post={post} highlightHover={true} />
                </Col>
              </Row>
            )
          })}
        </Container>

        <Footer />
      </main>
    </div>
  )
}
