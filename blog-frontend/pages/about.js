import Head from 'next/head'

import { NextSeo } from 'next-seo'

import { Container, Row, Col } from 'react-bootstrap'

import { Header } from '../components/layout/header'
import { Footer } from '../components/layout/footer'
import { BlogMarkdown } from '../components/blog-markdown'

const aboutMe = `
# About me

Hello 👋, Welcome!

## Story

My name is Dale and I currently live in Brooklyn, New York, 🇺🇸.
I live in a tiny apartment amongst the chaotic and messy streets of the city, it's not for everyone but, I love it.

I started my journey in Melbourne, Australia 🇦🇺. In 2015, I was lucky enough to join a fast-growing start-up [A Cloud Guru](https://acloudguru.com)
as the first employee. A Cloud Guru went from one person to over 600 in 4 years. I (and eventually my team) worked on what
I think to be some of the most interesting/critical parts of the platform, such as; video delivery & transcoding, course management,
billing & subscription, content search, video transcriptions, etc. 

After around 4 years of working within / leading a product team, I wanted to try something different; this is when I moved to Austin, Texas
 and started leading the DevOps team. The purpose of this team was to provide the 19 product teams with best practices; these were made available through
 a Serverless [Golden Path](https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/).

In 2021 A Cloud Guru got acquired by [Pluralsight](https://www.pluralsight.com/) in the 2nd largest tech acquisition in Australian history. What a crazy time.
  
Now in 2022 / 2023, I am working for another Serverless start-up, [Vendia](https://www.vendia.com/).
Vendia is an inter-company data sharing platform, that uses a [permissioned blockchain](https://101blockchains.com/permissioned-blockchain/).
Vendia is founded by the creator of AWS Lambda, Tim Wagner. 
`

const interests = `
## Technology Interests

I have interests in Serverless, AWS CDK, Leadership, Observability and DevOps. Which is what this blog is for, to capture my thoughts
and to share some of my successes and failures in trying to bring these concepts together
`

export default function About() {
  return (
    <div>
      <Head>
        <link rel="icon" href="https://blog-production-image-bucket.s3-accelerate.amazonaws.com/logo-4.png" />
      </Head>

      <main>
        <NextSeo
          title={'About me'}
          description={'About Dale Salter'}
          canonical={`${process.env.NEXT_PUBLIC_VERCEL_URL}/about`}
          openGraph={{
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/about`,
            title: 'About Dale Salter',
            description: 'About Dale Salter',
            images: [
              {
                url: 'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/49b5d292-66f8-49a0-9d6e-443984fcc8f7-2B84A38A-5894-4C12-AD65-933B785870CB_1_105_c.jpeg',
                width: 600,
                height: 600,
                alt: 'Og Blog Artwork',
                type: 'image/jpeg',
              },
            ],
            siteName: 'Dale Salter - Blog',
          }}
          twitter={{
            handle: '@enepture',
            site: '@enepture',
            title: 'About Dale Salter',
            description: 'About Dale Salter',
            image:
              'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/49b5d292-66f8-49a0-9d6e-443984fcc8f7-2B84A38A-5894-4C12-AD65-933B785870CB_1_105_c.jpeg',
            cardType: 'summary_large_image',
          }}
        />

        <Header />

        <Container>
          <Row>
            <Col md={8}>
              <BlogMarkdown escapeHtml={false} source={aboutMe} />
            </Col>
            <Col style={{ alignSelf: 'center', justifyContent: 'center', display: 'flex' }}>
              <img
                style={{ width: '75%', maxWidth: 200 }}
                src="https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/49b5d292-66f8-49a0-9d6e-443984fcc8f7-2B84A38A-5894-4C12-AD65-933B785870CB_1_105_c.jpeg"
              ></img>
            </Col>
          </Row>
          <Row>
            <Col>
              <BlogMarkdown escapeHtml={false} source={interests} />
            </Col>
          </Row>
        </Container>

        <Footer />
      </main>
    </div>
  )
}
