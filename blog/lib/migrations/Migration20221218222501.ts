import { Migration } from '@mikro-orm/migrations'

export class Migration20221218222501 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "post" add column "url_stub" text null;')
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" drop column "url_stub";')
  }
}
