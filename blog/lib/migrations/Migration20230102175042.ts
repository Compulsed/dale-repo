import { Migration } from '@mikro-orm/migrations'

export class Migration20230102175042 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "tag" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "name" text not null, constraint "tag_pkey" primary key ("id"));'
    )

    this.addSql('create table "post_tags" ("id" serial primary key, "post_id" uuid not null, "tag_id" uuid not null);')

    this.addSql(
      'alter table "post_tags" add constraint "post_tags_post_id_foreign" foreign key ("post_id") references "post" ("id") on update cascade on delete cascade;'
    )
    this.addSql(
      'alter table "post_tags" add constraint "post_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;'
    )
  }

  async down(): Promise<void> {
    this.addSql('alter table "post_tags" drop constraint "post_tags_tag_id_foreign";')

    this.addSql('drop table if exists "tag" cascade;')

    this.addSql('drop table if exists "post_tags" cascade;')
  }
}
