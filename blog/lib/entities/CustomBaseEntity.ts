import { PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'

export abstract class CustomBaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @Property({ type: 'datetime' })
  createdAt: Date = new Date()

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
