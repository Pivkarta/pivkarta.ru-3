import { isCompanyCanonicalPath } from '../app/pages/Companies/Company/routePath.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import knex from 'knex'
import { graphql, validateSchema } from 'graphql'
import { schema } from '../server/schema/index.ts'
import {
  queryCompanies,
  queryUsers,
  queryBeers,
  queryCompanyBeers,
} from '../server/schema/types/OLD/queries.ts'
import { paginate } from '../server/schema/types/OLD/query.ts'
import {
  legacyJson,
  nullableNumber,
} from '../server/schema/types/OLD/values.ts'

const db = knex({ client: 'mysql2' })
const ctx = { knex: db, req: undefined }

test('Схема корректна, секреты пользователей и мутации недоступны', () => {
  assert.deepEqual(validateSchema(schema), [])
  const fields = schema.getType('OldUser').getFields()
  for (const field of [
    'password',
    'email',
    'ip',
    'confirmation_code',
    'sudo',
    'mobile_phone',
  ])
    assert.equal(fields[field], undefined)
  assert.equal(schema.getMutationType(), undefined)
  const sql = queryUsers(ctx).toSQL().sql
  assert.doesNotMatch(sql, /`password`|`email`|`ip`/)
  assert.match(sql, /`item`.`hidden` is null or `item`.`hidden` =/)
  assert.match(sql, /`item`.`deleted` is null or `item`.`deleted` =/)
})

test('Фильтры параметризованы, false и ноль сохранены, LIKE экранирован', () => {
  const query = queryCompanies(ctx, {
    city_id: 0,
    active: false,
    name: "%' OR 1=1 --_",
  }).toSQL()
  assert.ok(query.bindings.includes(0))
  assert.ok(query.bindings.includes(false))
  assert.ok(query.bindings.includes("%!%' OR 1=1 --!_%"))
  assert.doesNotMatch(query.sql, /OR 1=1/)
})

test('Связи используют реальные таблицы Prisma и направления A/B', () => {
  const company = queryCompanies(ctx, {
    ownerId: 'user',
    beerId: 'beer',
  }).toSQL()
  assert.match(company.sql, /select `A` from `_UserOwnedPlaces` where `B` =/)
  assert.match(company.sql, /select `A` from `_PlaceBeerPlace`/)
  const beer = queryBeers(ctx, { companyId: 'place' }).toSQL()
  assert.match(beer.sql, /select `A` from `_PlaceBeerBeer`/)
  const assortment = queryCompanyBeers(ctx, {
    minPrice: 0,
    companyId: 'place',
    beerId: 'beer',
  }).toSQL()
  assert.match(assortment.sql, /select `B` from `_PlaceBeerPlace` where `A` =/)
  assert.match(assortment.sql, /select `B` from `_PlaceBeerBeer` where `A` =/)
  assert.ok(assortment.bindings.includes(0))
})

test('Пагинация ограничена, take=0 не превращается в неограниченную выборку', () => {
  assert.equal(
    paginate(queryCompanies(ctx), { take: 0 }).toSQL().bindings.at(-1),
    0,
  )
  assert.equal(paginate(queryCompanies(ctx), {}).toSQL().bindings.at(-1), 20)
  assert.match(
    paginate(queryCompanies(ctx), { orderBy: 'name' }).toSQL().sql,
    /order by `item`.`name` asc, `item`.`id` asc/,
  )
  for (const args of [{ take: -1 }, { take: 101 }, { skip: -1 }])
    assert.throws(() => paginate(queryCompanies(ctx), args), /take/)
})

test('GraphQL отклоняет некорректную пагинацию и пустой селектор до обращения в БД', async () => {
  for (const source of [
    '{ oldCompanies(take: -1) { id } }',
    '{ oldUser { id } }',
    '{ oldCompany(id: "") { id } }',
  ]) {
    const result = await graphql({ schema, source, contextValue: ctx })
    assert.equal(result.errors?.[0].extensions.code, 'BAD_USER_INPUT')
  }
})

test('Старые JSON и DECIMAL корректно преобразуются', () => {
  assert.deepEqual(legacyJson('{"blocks":[]}'), { blocks: [] })
  assert.equal(legacyJson(''), null)
  assert.equal(legacyJson('сломанный JSON'), null)
  assert.equal(nullableNumber('43.462195396423370000'), 43.46219539642337)
  assert.equal(nullableNumber('0.000'), 0)
  assert.equal(nullableNumber(null), null)
})

test('Служебные URL React Router не вызывают цикл канонических редиректов', () => {
  const uri = '/place/3770/demka/'
  for (const path of [
    uri,
    '/place/3770/demka.data',
    '/place/3770/demka/_.data',
  ])
    assert.equal(isCompanyCanonicalPath(path, uri), true)
  for (const path of [
    '/place/3770/demka',
    '/place/3770/wrong/_.data',
    '/place/3770.data',
  ])
    assert.equal(isCompanyCanonicalPath(path, uri), false)
})
