import { rule } from 'graphql-shield'

export const isDevMode = rule()(() => {
  return process.env.NODE_ENV === 'development'
})
