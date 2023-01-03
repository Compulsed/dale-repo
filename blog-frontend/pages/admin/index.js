import Head from 'next/head'
import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { Container, Row, Col, Button, Badge } from 'react-bootstrap'

import { Header } from '../../components/layout/header'
import { Footer } from '../../components/layout/footer'
import { PostCard } from '../../components/card'
import { CenterSpinner } from '../../components/spinner'

const GET_POSTS = gql`
  query ($secret: String!, $tags: [String!]) {
    tags {
      id
      name
      posts {
        id
      }
      editorPosts(secret: $secret) {
        id
      }
    }
    editorPosts(secret: $secret, tags: $tags) {
      id
      title
      shortDescription
      urlStub
      longDescription
      imageUrl
      body
      createdAt
      updatedAt
      publishStatus
      tags {
        id
        name
      }
    }
  }
`

const Editor = () => {
  const router = useRouter()

  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { secret: localStorage.getItem('_password'), tags: router.query.tag ? [router.query.tag] : null },
  })

  return (
    <div>
      <Head>
        <link rel="icon" href="https://blog-production-image-bucket.s3-accelerate.amazonaws.com/logo-4.png" />
      </Head>

      <main>
        <Header />

        <Container>
          <Row>
            <Col style={{ padding: 10 }}>
              <h1 style={{ display: 'inline-block' }}>Admin Editor</h1>
              <Link href="/admin/post/create" as="/admin/post/create" passHref>
                <Button className="mt-2" style={{ float: 'right' }} variant="light">
                  Create New Post
                </Button>
              </Link>
            </Col>
          </Row>

          {loading && <CenterSpinner animation="grow" />}

          <div style={{ border: '1px solid #e3e3e3', borderRadius: 5, padding: 10 }}>
            {data &&
              data.tags.map(({ name, posts, editorPosts }) => (
                <Link
                  href={{
                    pathname: '/admin',
                    query: { tag: name },
                  }}
                >
                  <Badge key={name} bg="light" text="dark">
                    {name} ({posts.length}, {editorPosts.length})
                  </Badge>
                </Link>
              ))}
          </div>

          {((data && data.editorPosts) || []).map((post) => {
            return (
              <Row key={post.id}>
                <Col style={{ padding: 10 }}>
                  <PostCard post={post} highlightHover={true} editMode={true} />
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

export default dynamic(() => Promise.resolve(Editor), {
  ssr: false,
})
