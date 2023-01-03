import moment from 'moment'
import styled from 'styled-components'
import Link from 'next/link'

import { Row, Col, Badge } from 'react-bootstrap'

export const PostCard = ({ post, highlightHover = false, editMode }) => {
  return (
    <Link
      href={!editMode ? '/post/[id]/[url-stub]' : '/admin/post/[id]'}
      as={!editMode ? `/post/${post.id}/${post.urlStub}` : `/admin/post/${post.id}`}
      passHref
      legacyBehavior
    >
      <ArticleLink>
        <ArticleCard highlightHover={highlightHover && post.publishStatus !== 'PUBLISHED'}>
          {(editMode || post.publishStatus !== 'PUBLISHED') && (
            <Row>
              <Col sm={10}>
                {post.publishStatus === 'DRAFT' && <Badge bg="secondary">DRAFT</Badge>}
                {post.publishStatus === 'HIDDEN' && <Badge bg="dark">HIDDEN</Badge>}
                {post.publishStatus === 'PUBLISHED' && <Badge bg="primary">PUBLISHED</Badge>}
              </Col>
            </Row>
          )}

          <Row>
            <Col sm={10}>
              <h3>{post.title}</h3>
              <h5 className="mb-2 text-muted">{post.shortDescription}</h5>
              <p>{post.longDescription}</p>
              <p className="small">
                Posted {moment(post.createdAt).fromNow(true)} ago
                {post.updatedAt ? ', last updated ' + moment(post.updatedAt).fromNow(true) + ' ago.' : ''}
              </p>
              <p>
                {post.tags.map(({ name }) => (
                  <Badge key={name} bg="light" text="dark">
                    {name}
                  </Badge>
                ))}
              </p>
            </Col>
            <Col sm={2} style={{ display: 'flex', justifyContent: 'center', alignSelf: 'center' }}>
              <ArticleImage src={post.imageUrl} />
            </Col>
          </Row>
        </ArticleCard>
      </ArticleLink>
    </Link>
  )
}

const ArticleImage = styled.img`
  width: 80%;
  max-width: 200px;
`

const ArticleLink = styled.a`
  text-decoration: none;
  color: inherit;
  outline: 0;
  cursor: auto;

  :hover {
    text-decoration: none;
    color: inherit;
    outline: 0;
    cursor: auto;
  }
`

const ArticleCard = styled.div`
  border: ${(props) => (props.highlightHover ? '1px solid transparent' : '1px solid #d0d0d0')};

  padding 20px;
  border-radius: 5px;
  box-shadow: 0px 3px 15px rgba(0,0,0,0.01);

  :hover {
    border: 1px solid #d0d0d0;
    cursor: pointer;
  }
`
