import { Migration } from '@mikro-orm/migrations'

export class Migration20221119023231 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "pages" ("uuid" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null, constraint "pages_pkey" primary key ("uuid"));'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "pages" cascade;')
  }
}
