import { Migration } from '@mikro-orm/migrations'
import postData from '../../production-data/data.json'

const mapSQL = (row: any) => {
  const convertDBFormat = (property: any) => (property !== null ? `E'${property.replaceAll("'", `\\'`)}'` : 'NULL')

  for (const [key, value] of Object.entries(row)) {
    row[key] = convertDBFormat(value)
  }

  return `INSERT INTO "public"."post" 
    ("id", "created_at", "updated_at", "title", "body", "short_description", "long_description", "image_url", "publish_status", "available_with_link") 
    VALUES (${row.id}, ${row.createdAt}, ${row.updatedAt}, ${row.title}, ${row.body}, ${row.shortDescription}, ${row.shortDescription}, ${row.imageUrl}, ${row.publishStatus}, 'f');`
}

export class Migration20221126184955 extends Migration {
  async up(): Promise<void> {
    postData.data.editorPosts.forEach((post: any) => {
      this.addSql(mapSQL(post))
    })
  }

  async down(): Promise<void> {
    return
  }
}
