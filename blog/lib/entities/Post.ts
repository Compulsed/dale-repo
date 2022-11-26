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
  title: string | null

  @Property({ type: 'text', nullable: true })
  body: string | null

  @Property({ type: 'text', nullable: true })
  shortDescription: string | null

  @Property({ type: 'text', nullable: true })
  longDescription: string | null

  @Property({ type: 'text', nullable: true })
  imageUrl: string | null

  @Property({ type: 'text', nullable: true })
  publishStatus: string | null

  @Property({ type: 'boolean', nullable: true })
  availableWithLink: boolean | null
}
