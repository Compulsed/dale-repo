import { Property, Entity } from '@mikro-orm/core'
import { CustomBaseEntity } from './CustomBaseEntity'

@Entity()
export class Post extends CustomBaseEntity {
  constructor(id: string | null, data: Partial<Post>) {
    super()

    if (id) {
      this.id = id
    }

    Object.assign(this, data)
  }

  @Property({ type: 'text', nullable: true })
  title: string

  @Property({ type: 'text', nullable: true })
  body: string

  @Property({ type: 'text', nullable: true })
  shortDescription: string

  @Property({ type: 'text', nullable: true })
  longDescription: string

  @Property({ type: 'text', nullable: true })
  imageUrl: string

  @Property({ type: 'text', nullable: true })
  publishStatus: string

  @Property({ type: 'boolean', nullable: true })
  availableWithLink: boolean
}
