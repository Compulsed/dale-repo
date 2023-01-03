import Head from 'next/head'

import { Container, Row, Col } from 'react-bootstrap'

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
        <link rel="icon" href="https://blog-production-image-bucket.s3-accelerate.amazonaws.com/logo-4.png" />
      </Head>

      <main>
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
