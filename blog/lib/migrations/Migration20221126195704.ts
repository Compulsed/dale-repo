import { Migration } from '@mikro-orm/migrations'

export class Migration20221126195704 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "post" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "title" text null, "body" text null, "short_description" text null, "long_description" text null, "image_url" text null, "publish_status" text null, "available_with_link" boolean null, constraint "post_pkey" primary key ("id"));'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;')
  }
}
