import { Migration } from '@mikro-orm/migrations'

export class Migration20221119022401 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "book" alter column "uuid" drop default;')
    this.addSql('alter table "book" alter column "uuid" type uuid using ("uuid"::text::uuid);')
    this.addSql('alter table "book" alter column "title" type text using ("title"::text);')
  }

  async down(): Promise<void> {
    this.addSql('alter table "book" alter column "uuid" type text using ("uuid"::text);')

    this.addSql('alter table "book" alter column "uuid" type varchar(255) using ("uuid"::varchar(255));')
    this.addSql('alter table "book" alter column "title" type varchar(255) using ("title"::varchar(255));')
  }
}
