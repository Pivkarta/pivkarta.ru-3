import { builder } from 'server/schema/builder'

builder.queryField('oldCompanies', (t) =>
  t.field({
    type: 'Json',
    args: {
      take: t.arg.int(),
    },
    async resolve() {
      return []
    },
  }),
)
