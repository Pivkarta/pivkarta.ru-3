import knex from 'knex'

const MYSQL_URL = process.env.MYSQL_URL

if (!MYSQL_URL) {
  throw new Error('MYSQL_URL env is empty')
}

export const knexClient = knex({
  client: 'mysql2',
  connection: MYSQL_URL,
})
