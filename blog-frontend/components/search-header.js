import { Container, Row, Col, Badge } from 'react-bootstrap'
import Link from 'next/link'

export const SearchHeader = ({ tags, selectedTag }) => (
  <Container style={{ marginTop: 20, marginBottom: 30 }}>
    <Row>
      <Col>
        <div style={{ border: '1px solid #e3e3e3', borderRadius: 5, padding: 10 }}>
          {(tags || [])
            .filter(({ posts }) => posts.length)
            .map(({ name, posts }) => (
              <Link
                key={name}
                href={{
                  pathname: '/search/[tag]',
                  query: { tag: name },
                }}
              >
                <Badge
                  key={name}
                  bg={selectedTag === name ? 'dark' : 'light'}
                  text={selectedTag === name ? 'light' : 'dark'}
                >
                  {name} ({posts.length})
                </Badge>
              </Link>
            ))}
        </div>
      </Col>
    </Row>
  </Container>
)
