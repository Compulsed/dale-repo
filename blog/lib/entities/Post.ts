import { Property, Entity } from '@mikro-orm/core'
import { CustomBaseEntity } from './CustomBaseEntity'

@Entity()
export class Post extends CustomBaseEntity {
  @Property({ type: 'text' })
  postId: string

  @Property({ type: 'text' })
  title: string

  @Property({ type: 'text' })
  body: string

  @Property({ type: 'text' })
  shortDescription: string

  @Property({ type: 'text' })
  longDescription: string

  @Property({ type: 'text' })
  imageUrl: string

  @Property({ type: 'text' })
  publishStatus: string

  @Property({ type: 'boolean' })
  availableWithLink: boolean
}
