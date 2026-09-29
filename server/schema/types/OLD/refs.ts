import { builder } from 'server/schema/builder'
import type { CompanyRow } from './Company/interfaces'
import type { UserRow } from './User/interfaces'
import type { BeerRow } from './Beer/interfaces'
import type { CompanyBeerRow } from './CompanyBeer/interfaces'

export const OldCompany = builder.objectRef<CompanyRow>('OldCompany')
export const OldUser = builder.objectRef<UserRow>('OldUser')
export const OldBeer = builder.objectRef<BeerRow>('OldBeer')
export const OldCompanyBeer =
  builder.objectRef<CompanyBeerRow>('OldCompanyBeer')
