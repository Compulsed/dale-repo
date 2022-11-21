import { Migration } from '@mikro-orm/migrations';

export class Migration20221121030904 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "post_id" text not null, "title" text not null, "body" text not null, "short_description" text not null, "long_description" text not null, "image_url" text not null, "publish_status" text not null, "available_with_link" boolean not null, constraint "post_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
