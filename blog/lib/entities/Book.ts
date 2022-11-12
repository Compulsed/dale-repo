import { PrimaryKey, Property, Entity } from '@mikro-orm/core'
import { v4 } from 'uuid'

export abstract class CustomBaseEntity {
  @PrimaryKey({ type: 'uuid' })
  uuid: string = v4()

  @Property({ type: 'datetime' })
  createdAt: Date = new Date()

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}

@Entity()
export class Book extends CustomBaseEntity {
  @Property({ type: 'text' })
  title!: string
}
