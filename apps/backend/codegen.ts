import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apps/backend/src/app/modules',
  documents: 'libs/shared/data-source/src/lib/**/*.gql',
  generates: {
    'libs/shared/data-source/src/lib/types.ts': {
      plugins: ['typescript'],
      config: {
        addExplicitOverride: true,
        typesPrefix: 'I',
        skipTypename: true,
        scalars: {
          DateTime: 'string'
        }
      },
    },
  },
  overwrite: true
}

export default config
