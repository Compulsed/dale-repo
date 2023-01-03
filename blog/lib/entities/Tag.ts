import { Property, Entity, ManyToMany, Collection } from '@mikro-orm/core'
import { CustomBaseEntity } from './CustomBaseEntity'
import { Post } from './Post'

@Entity()
export class Tag extends CustomBaseEntity {
  constructor(id?: string) {
    super()

    if (id) {
      this.id = id
    }
  }

  @Property({ type: 'text', unique: true })
  name: string

  @ManyToMany(() => Post, (post) => post.tags)
  posts = new Collection<Post>(this)
}
