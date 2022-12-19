import Head from 'next/head'

import Disqus from 'disqus-react'
import { NextSeo } from 'next-seo'

import { Container, Row, Col } from 'react-bootstrap'

import { Header } from '../../../components/layout/header'
import { Footer } from '../../../components/layout/footer'
import { PostCard } from '../../../components/card'
import { BlogMarkdown } from '../../../components/blog-markdown'

const POSTS_QUERY = `
  query QueryPosts {
    posts {
      id
      urlStub
    }
  }
`

const POST_QUERY = `
  query QueryPost($id: ID!) {
    post(id: $id) {
      id
      title
      urlStub
      shortDescription
      longDescription
      imageUrl
      body
      createdAt
      updatedAt
    }
  }
`

export async function getStaticPaths() {
  // TODO use apollo client
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: POSTS_QUERY }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  const paths = data.data.posts.map((post) => ({
    params: { id: post.id, 'url-stub': post.urlStub || 'default' },
  }))

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(context) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: POST_QUERY, variables: { id: context.params.id } }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  return {
    props: { post: data.data.post },
    revalidate: 10,
  }
}

const DisqusComponent = ({ post }) => {
  const disqusShortname = 'dalejsalter'

  const disqusConfig = {
    url: `https://dalejsalter.com/post/${post.id}`,
    identifier: post.id,
    title: post.title,
  }

  return <Disqus.DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
}

export default function Post({ post }) {
  return (
    <div>
      <Head>
        <link rel="icon" href="https://blog-production-image-bucket.s3-accelerate.amazonaws.com/logo-4.png" />
      </Head>

      <main>
        <NextSeo
          title={post.title}
          description={post.shortDescription}
          canonical={`${process.env.NEXT_PUBLIC_VERCEL_URL}/post/${post.id}`}
          openGraph={{
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/post/${post.id}`,
            title: post.title,
            description: post.shortDescription,
            images: [
              {
                url: post.imageUrl,
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
            title: post.title,
            description: post.description,
            image: post.imageUrl,
            cardType: 'summary_large_image',
          }}
        />

        <Header />

        <Container>
          {post && (
            <div>
              <Row key={post.id}>
                <Col style={{ padding: 10 }}>
                  <PostCard post={post} highlightHover={false} />
                </Col>
              </Row>
              <Row>
                <Col style={{ padding: 10 }}>
                  <BlogMarkdown escapeHtml={false} source={post.body} />
                </Col>
              </Row>
              <Row>
                <Col style={{ padding: 10 }}>
                  <DisqusComponent post={post} />
                </Col>
              </Row>
            </div>
          )}
        </Container>

        <Footer />
      </main>
    </div>
  )
}
