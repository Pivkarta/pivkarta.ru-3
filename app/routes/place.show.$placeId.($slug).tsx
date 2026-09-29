import type { LoaderFunctionArgs } from 'react-router'
import { loadCompany } from '../pages/Companies/Company/load.server'
export const loader = (
  args: LoaderFunctionArgs,
): ReturnType<typeof loadCompany> => loadCompany(args)
