import Head from 'next/head'

import { Container, Row, Col } from 'react-bootstrap'
import { NextSeo } from 'next-seo'

import { Header } from '../../components/layout/header'
import { Footer } from '../../components/layout/footer'
import { PostCard } from '../../components/card'
import { SearchHeader } from '../../components/search-header'

const POSTS_QUERY = `
  query QueryPosts ($tags: [String!]) {
    tags {
      id
      name
      posts {
        id
      }
    }
    posts(tags: $tags) {
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

export async function getStaticPaths() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: POSTS_QUERY }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  const paths = data.data.tags.map((tag) => ({
    params: { tag: tag.name },
  }))

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(context) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    body: JSON.stringify(
      { query: POSTS_QUERY, variables: { tags: context.params.tag ? [context.params.tag] : null } },
      null,
      2
    ),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  return {
    props: { posts: data.data.posts, tags: data.data.tags, selectedTag: context.params.tag },
    revalidate: 10,
  }
}

export default function Home({ posts, tags, selectedTag }) {
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
          title={`Dale Salter's Blog - Search ${selectedTag}`}
          description={`Topics related to ${selectedTag}`}
          canonical={`${process.env.NEXT_PUBLIC_VERCEL_URL}/search/${selectedTag}`}
          openGraph={{
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/search/${selectedTag}`,
            title: `Dale Salter's Blog - Search ${selectedTag}`,
            description: `Topics related to ${selectedTag}`,
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
            title: `Dale Salter's Blog - Search ${selectedTag}`,
            description: `Topics related to ${selectedTag}`,
            image:
              'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/99779162-8819-4754-b45f-587784684e44-logo-4.png',
            cardType: 'summary_large_image',
          }}
        />

        <Header />

        <SearchHeader tags={tags} selectedTag={selectedTag} />

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
