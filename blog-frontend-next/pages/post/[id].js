const POSTS_QUERY = `
  query QueryPosts {
    posts {
      title
      id
    }
  }
`

const POST_QUERY = `
  query QueryPost($id: ID!) {
    post(id: $id) {
      title
      id
    }
  }
`

export async function getStaticPaths() {
  const res = await fetch('https://dev.api-blog.dalejsalter.com/', {
    method: 'POST',
    body: JSON.stringify({ query: POSTS_QUERY }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  const paths = data.data.posts.map((post) => ({
    params: { id: post.id },
  }))

  // { fallback: false } means other routes should 404
  return { paths, fallback: false }
}

export async function getStaticProps(context) {
  console.log('context', context)

  const res = await fetch('https://dev.api-blog.dalejsalter.com/', {
    method: 'POST',
    body: JSON.stringify({ query: POST_QUERY, variables: { id: context.params.id } }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  return {
    props: { post: data.data.post },
  }
}

export default function Post({ post }) {
  return <h1 style={{ color: 'white' }}>{post.title || 'undefined'}</h1>
}
