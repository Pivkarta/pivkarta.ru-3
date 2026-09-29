import { knexClient } from '../knex'
import { PrismaContext } from './interfaces'

type CreateContextArgs = {
  req: PrismaContext['req'] | { headers: { authorization: string | undefined } }
}

export async function createContext({
  req,
}: CreateContextArgs): Promise<PrismaContext> {
  return {
    knex: knexClient,
    req,
  }
}
