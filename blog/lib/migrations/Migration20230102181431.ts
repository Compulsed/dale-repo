import { Migration } from '@mikro-orm/migrations'

export class Migration20230102181431 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "tag" add constraint "tag_name_unique" unique ("name");')
  }

  async down(): Promise<void> {
    this.addSql('alter table "tag" drop constraint "tag_name_unique";')
  }
}
