import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { Button, Form, Container, Spinner } from 'react-bootstrap'

import { Header } from '../../../components/layout/header'
import { Footer } from '../../../components/layout/footer'
import { WEBSITE_ICON } from '../../../components/constants'

const CREATE_POST = gql`
  mutation ($postInput: PostInput!, $secret: String!) {
    createPost(postInput: $postInput, secret: $secret) {
      status
      post {
        id
        title
        shortDescription
        urlStub
        longDescription
        imageUrl
        body
        createdAt
        updatedAt
      }
      errorMessage
    }
  }
`

const defaultBodyString = `\
# Sub Lenaee

## Flumina temptantes semianimes esse corpore

Lorem markdownum movet se somni. [Hunc](http://factaexpalluit.org/ventos.html)
sacris, at ignara ausus! Silvani modo est, tinnitibus tempore meque. Greges est,
et arma regnum mortale, et suis, huic carmina arva. Servantis facere.

Iunonis Peneos. Ille deam harundine orbis. Mors cauda sed idque socero ungues
femur moderantur [meque](http://bovis-opem.net/vivebat): illi loca adhuc, iam?

\`\`\`
var of = portalRootkitWindows.baudDocking(kvmAd, pptp_frame);
var chipsetPack = multimedia(e_ebook - 20 - androidSnippet.circuitTftp(3));
ccCard.token_p = digital;
soap_gigabyte = text_memory.user(pipeline_icf, web.heat_rj(5 *
        systray_toggle), sata_flops_boot + character);
\`\`\`


![alt text](https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/99779162-8819-4754-b45f-587784684e44-logo-4.png "Logo Title From DB Text 1")

Ebrius ostia non, nato [non durat](http://www.aiacem.net/tulisset) poenas
tumebat cultum meritum homines premunt. Ardet hederis, viro, alas saepius,
Priamus duratur. Quia sic choreas, suos: ceperunt vaticinor hoc et illi
accipiunt. Tota resto amatas, secundo at cera qua humilem; quam [muneris
fontis](http://mihi.io/) pessima generis umbras; Aeacus, perdere.

## Frontis numina

Capto **divulsere vertice pastor** numina Troiae Theseu Iuno et meo ergo
crescere tamen, hostiliter in guttura. Accipe mittunt piasque pectora; aevi
Phoebe Palaemona videoque anum **sua quoque**.

1. Ille praedae aristas iura
2. Parte tamen
3. Et atra Euagrus mitibus habenti Memnonides gravitate
4. Habuit talibus venientem enim
`

const defaultFormValues = {
  title: 'Title From Form',
  imageUrl:
    'https://bloginfrastructure-prod-imagebucket97210811-1mgqvezvs9c8h.s3-accelerate.amazonaws.com/2b172a5f-5dc2-45c2-b78c-7d02bc651c8e-wip.png',
  shortDescription: 'Lorem Ipsum is simply dummy text of the printing',
  urlStub: 'default',
  longDescription: 'Lorem Ipsum is simply dummy text of the printing Lorem Ipsum is simply dummy text of the printing',
  body: defaultBodyString,
}

const PostForm = () => {
  const router = useRouter()
  const [createPost, { data, loading }] = useMutation(CREATE_POST)

  // Handle Success
  if (data && data.createPost && data.createPost.status) {
    router.push(`/admin/post/[id]`, `/admin/post/${data.createPost.post.id}`)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.currentTarget

    const id = uuidv4()

    const postInput = {
      title: form.elements.title.value,
      imageUrl: form.elements.imageUrl.value,
      urlStub: form.elements.urlStub.value,
      shortDescription: form.elements.shortDescription.value,
      longDescription: form.elements.longDescription.value,
      body: form.elements.body.value,
    }

    const secret = localStorage.getItem('_password')

    createPost({ variables: { id, postInput, secret } })
  }

  return (
    <Form className="mb-5" onSubmit={handleSubmit}>
      <Form.Group controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" defaultValue={defaultFormValues.title} />
      </Form.Group>

      <Form.Group controlId="urlStub">
        <Form.Label>Url Stub</Form.Label>
        <Form.Control type="text" defaultValue={defaultFormValues.urlStub} />
      </Form.Group>

      <Form.Group controlId="imageUrl">
        <Form.Label>Image URL</Form.Label>
        <Form.Control type="text" defaultValue={defaultFormValues.imageUrl} />
      </Form.Group>

      <Form.Group controlId="shortDescription">
        <Form.Label>Short Description</Form.Label>
        <Form.Control as="textarea" rows="1" defaultValue={defaultFormValues.shortDescription} />
      </Form.Group>

      <Form.Group controlId="longDescription">
        <Form.Label>Long Description</Form.Label>
        <Form.Control as="textarea" rows="3" defaultValue={defaultFormValues.longDescription} />
      </Form.Group>

      <hr className="mt-5 mb-5"></hr>

      <Form.Group controlId="body">
        <Form.Label>Body</Form.Label>
        <Form.Control as="textarea" rows="20" defaultValue={defaultFormValues.body} />
      </Form.Group>

      <hr className="mt-5 mb-5"></hr>

      <div>
        <Button variant="dark" type="submit">
          {!loading ? 'Create' : <Spinner size="sm" animation="border" variant="light" />}
        </Button>
        <span className="ml-2">{data?.createPost?.status === false && data?.createPost?.errorMessage}</span>
      </div>
    </Form>
  )
}

function Post() {
  return (
    <div>
      <Head>
        <link rel="icon" href={WEBSITE_ICON} />
      </Head>

      <main>
        <Header />

        <Container>
          <h1 className="mb-5">New Post</h1>

          <PostForm />
        </Container>

        <Footer />
      </main>
    </div>
  )
}

export default Post
