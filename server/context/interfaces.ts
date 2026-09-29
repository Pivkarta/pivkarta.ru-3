import { ExpressContextFunctionArgument } from '@as-integrations/express5'
import { Knex } from 'knex'

export interface PrismaContext {
  knex: Knex
  req:
    | ExpressContextFunctionArgument['req']
    | Pick<ExpressContextFunctionArgument['req'], 'headers'>
    | undefined
}
