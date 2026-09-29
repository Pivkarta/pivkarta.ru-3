import SchemaBuilder from '@pothos/core'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'
import { DateTimeResolver, JSONResolver } from 'graphql-scalars'
import { PrismaContext } from 'server/context/interfaces'
// import { GraphQLUpload } from './scalars/Upload'

export const builder = new SchemaBuilder<{
  Context: PrismaContext
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
    Json: {
      Input: unknown
      Output: unknown
    }
    Upload: {
      Input: unknown
      Output: never
    }
  }
}>({
  plugins: [SimpleObjectsPlugin],
  // relay: {},
})

builder.addScalarType('DateTime', DateTimeResolver)
builder.addScalarType('Json', JSONResolver)
// builder.addScalarType('Upload', GraphQLUpload)

builder.queryType({})
// builder.mutationType({})
