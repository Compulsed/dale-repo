import { Migration } from '@mikro-orm/migrations'

export class Migration20221121033432 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "post_id" type text using ("post_id"::text);')
    this.addSql('alter table "post" alter column "post_id" drop not null;')
    this.addSql('alter table "post" alter column "title" type text using ("title"::text);')
    this.addSql('alter table "post" alter column "title" drop not null;')
    this.addSql('alter table "post" alter column "body" type text using ("body"::text);')
    this.addSql('alter table "post" alter column "body" drop not null;')
    this.addSql('alter table "post" alter column "short_description" type text using ("short_description"::text);')
    this.addSql('alter table "post" alter column "short_description" drop not null;')
    this.addSql('alter table "post" alter column "long_description" type text using ("long_description"::text);')
    this.addSql('alter table "post" alter column "long_description" drop not null;')
    this.addSql('alter table "post" alter column "image_url" type text using ("image_url"::text);')
    this.addSql('alter table "post" alter column "image_url" drop not null;')
    this.addSql('alter table "post" alter column "publish_status" type text using ("publish_status"::text);')
    this.addSql('alter table "post" alter column "publish_status" drop not null;')
    this.addSql(
      'alter table "post" alter column "available_with_link" type boolean using ("available_with_link"::boolean);'
    )
    this.addSql('alter table "post" alter column "available_with_link" drop not null;')
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "post_id" type text using ("post_id"::text);')
    this.addSql('alter table "post" alter column "post_id" set not null;')
    this.addSql('alter table "post" alter column "title" type text using ("title"::text);')
    this.addSql('alter table "post" alter column "title" set not null;')
    this.addSql('alter table "post" alter column "body" type text using ("body"::text);')
    this.addSql('alter table "post" alter column "body" set not null;')
    this.addSql('alter table "post" alter column "short_description" type text using ("short_description"::text);')
    this.addSql('alter table "post" alter column "short_description" set not null;')
    this.addSql('alter table "post" alter column "long_description" type text using ("long_description"::text);')
    this.addSql('alter table "post" alter column "long_description" set not null;')
    this.addSql('alter table "post" alter column "image_url" type text using ("image_url"::text);')
    this.addSql('alter table "post" alter column "image_url" set not null;')
    this.addSql('alter table "post" alter column "publish_status" type text using ("publish_status"::text);')
    this.addSql('alter table "post" alter column "publish_status" set not null;')
    this.addSql(
      'alter table "post" alter column "available_with_link" type boolean using ("available_with_link"::boolean);'
    )
    this.addSql('alter table "post" alter column "available_with_link" set not null;')
  }
}
