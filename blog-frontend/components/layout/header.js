import Link from 'next/link'

import { Container, Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { FaLinkedin, FaTwitterSquare, FaGithubSquare } from 'react-icons/fa'
import { WEBSITE_ICON } from '../../components/constants'

export const Header = () => {
  return (
    <SpacedContainer>
      <Row>
        <Col style={{ flex: '0 0 50px', padding: 0, justifyContent: 'center' }}>
          <Link href="/" as="/" passHref legacyBehavior>
            <a>
              <img style={{ width: '100%' }} src={WEBSITE_ICON} />
            </a>
          </Link>
        </Col>
        <Col md={8}>
          <Link href="/" as="/" passHref legacyBehavior>
            <TitleLink>
              <Title>Dale Salter</Title>
            </TitleLink>
          </Link>
          <h6 className="mb-0 text-muted">Software Engineering, Leadership, DevOps</h6>
        </Col>
        <Col style={{ alignSelf: 'flex-end' }}>
          <SocialBar>
            <p className="mb-0">
              <Link href="/about" as="/about" passHref legacyBehavior>
                <TitleLink>
                  <span style={{ marginRight: 12 }}>About Me</span>
                </TitleLink>
              </Link>
              <span style={{ display: 'inline-block', position: 'relative', top: -2 }}>
                <a href="https://twitter.com/enepture" rel="noopener noreferrer" target="_blank">
                  <SocialIcon>
                    <FaTwitterSquare />
                  </SocialIcon>
                </a>
                <a href="https://github.com/Compulsed" rel="noopener noreferrer" target="_blank">
                  <SocialIcon>
                    <FaGithubSquare />
                  </SocialIcon>
                </a>
                <a href="https://www.linkedin.com/in/dalesalter/" rel="noopener noreferrer" target="_blank">
                  <SocialIcon>
                    <FaLinkedin />
                  </SocialIcon>
                </a>
              </span>
            </p>
          </SocialBar>
        </Col>
      </Row>
    </SpacedContainer>
  )
}

const Title = styled.h1`
  font-weight: 900;
  font-size: 2.5rem;
  margin-bottom: 0;
  letter-spacing: -0.02em;
`

const TitleLink = styled.a`
  color: inherit;
  text-decoration: none;

  :hover {
    text-decoration: none;
    color: inherit;
  }
`

const SpacedContainer = styled(Container)`
  margin-top: 30px;
  margin-bottom: 20px;
`

const SocialBar = styled.div`
  display: flex;
  fontsize: 18px;
  margin-bottom: 0px;

  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: start;
  }
`

const SocialIcon = styled.span`
  margin-right: 5px;
  font-size: 24px;
  color: black;
`
