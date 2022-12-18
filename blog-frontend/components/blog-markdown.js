import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// https://github.com/react-syntax-highlighter/react-syntax-highlighter
export const BlogMarkdown = ({ source }) => {
  return (
    <StyledReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              customStyle={{ border: '1px solid #e3e3e3', paddingTop: 20, paddingBottom: 20 }}
              children={String(children).replace(/\n$/, '')}
              style={coy}
              showLineNumbers={true}
              language={match[1]}
              PreTag="div"
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {source}
    </StyledReactMarkdown>
  )
}

export const StyledReactMarkdown = styled(ReactMarkdown)`
  padding 20px;
  margin-top: -30px;
  box-shadow: 0px 3px 15px rgba(0,0,0,0.01);

  h1 {
    font-size: 28px;
    margin-top: 50px;
    margin-bottom: 0px;
  }

  h2 {
    font-size: 20px;
    margin-top: 30px;
    margin-bottom: 0px;
  }

  h3 {
    font-size: 16px;
    margin-top: 30px;
    margin-bottom: 0px;
  }

  h4 {
    font-size: 14px;
    margin-top: 30px;
    margin-bottom: 0px;
  }

  h5 {
    font-size: 12px;
    margin-top: 30px;
    margin-bottom: 0px;
  }

  a {
    text-decoration: underline;
    color: #000;
  }

  ul {
    margin-top: -15px;
  }
  
  p {
    margin-top: 15px;
  }

  li > ul {
    margin-top: 0px;
  }

  input[type=checkbox] {
    margin-right: 10px;
  }

  img {
    display: block;
    margin-top: 25px;
    margin-bottom: 25px;
    margin-left: auto;
    margin-right: auto;
    width: 80%;
    padding: 20px;
  }
`
