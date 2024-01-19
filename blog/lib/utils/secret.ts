import { getEnvironment } from './get-environment'

const { BLOG_ADMIN_SECRET } = getEnvironment(['BLOG_ADMIN_SECRET'])

export const isSecret = (secret: string): boolean => {
  return secret === BLOG_ADMIN_SECRET
}
