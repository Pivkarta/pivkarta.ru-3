import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { knexClient as db } from '../server/knex/index'

try {
  const inventory: Record<string, unknown> = {}
  for (const [table, columns] of Object.entries({
    Beer: ['beer_id', 'url_name', 'is_request'],
    Place: ['place_id', 'url_name', 'city_id', 'is_request'],
    Topic: ['topic_id', 'url_name', 'published'],
    City: ['city_id', 'alias', 'name'],
    Comment: ['comment_id', 'object_id', 'type_id', 'is_checked'],
    User: ['user_id', 'username'],
  })) {
    const query = db(table).select(columns)
    if (table === 'User') {
      query
        .where((q) => q.whereNull('hidden').orWhere('hidden', 0))
        .where((q) => q.whereNull('deleted').orWhere('deleted', 0))
    }
    inventory[table] = await query.orderBy(columns[0])
  }
  await writeFile(
    'projects/tasks/003--url-structure/database-inventory.json',
    JSON.stringify(inventory, null, 2) + '\n',
  )
  console.warn(
    Object.fromEntries(
      Object.entries(inventory).map(([key, rows]) => [
        key,
        (rows as unknown[]).length,
      ]),
    ),
  )
  for (const [relation, entity] of [
    ['_UserTopics', 'Topic'],
    ['_UserComments', 'Comment'],
  ]) {
    console.warn(
      relation,
      await db(`${relation} as r`)
        .join(`${entity} as e`, 'r.A', 'e.id')
        .join('User as u', 'r.B', 'u.id')
        .count('* as count'),
    )
  }
  const entityTypes: Record<string, number> = {}
  const unsupported: { table: string; id: string; type: string }[] = []
  for (const [table, column] of Object.entries({
    Beer: 'editor_content',
    Place: 'content',
    Topic: 'editor_content',
    Comment: 'editor_content',
  })) {
    const rows = await db(table).select('id', column)
    for (const row of rows as { id: string; [key: string]: unknown }[]) {
      let value: unknown = row[column]
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value) as unknown
        } catch {
          continue
        }
      }
      if (
        !value ||
        typeof value !== 'object' ||
        !('entityMap' in value) ||
        !value.entityMap ||
        typeof value.entityMap !== 'object'
      ) {
        continue
      }
      for (const entity of Object.values(value.entityMap) as unknown[]) {
        if (!entity || typeof entity !== 'object' || !('type' in entity)) {
          continue
        }
        const type = String(entity.type)
        entityTypes[type] = (entityTypes[type] || 0) + 1
        if (!['LINK', 'IMAGE', 'CUT'].includes(type)) {
          unsupported.push({ table, id: row.id, type })
        }
      }
    }
  }
  await writeFile(
    'projects/tasks/003--url-structure/content-entities.json',
    JSON.stringify({ entityTypes, unsupported }, null, 2) + '\n',
  )
  console.warn('Типы встроенных элементов:', entityTypes)
} finally {
  await db.destroy()
}
