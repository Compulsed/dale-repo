import { useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'

const Login = (props) => {
  const router = useRouter()

  if (props.router.query.id) {
    localStorage.setItem('_password', props.router.query.id)
  }

  useEffect(() => {
    router.push(`/admin`, `/admin`)
  }, [])

  return <div></div>
}

export default withRouter(Login)
