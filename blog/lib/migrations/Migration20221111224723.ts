import { Migration } from '@mikro-orm/migrations'

export class Migration20221111224723 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "book" ("uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null, constraint "book_pkey" primary key ("uuid"));'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "book" cascade;')
  }
}
