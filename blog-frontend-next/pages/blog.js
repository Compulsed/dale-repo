const POSTS_QUERY = `
  query QueryPosts {
    posts {
      title
      id
    }
  }
`

export async function loadPosts() {
  const res = await fetch('https://dev.api-blog.dalejsalter.com/', {
    method: 'POST',
    body: JSON.stringify({ query: POSTS_QUERY }, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  return data.data.posts
}

function Blog({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

export async function getStaticProps() {
  const posts = await loadPosts()

  return { props: { posts } }
}

export default Blog
