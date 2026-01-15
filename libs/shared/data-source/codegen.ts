import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'apps/backend/src/app/modules',
  generates: {
    [`libs/shared/data-source/auth/src/lib/auth.generated.ts`]: {
      documents: `libs/shared/data-source/auth/src/lib/*.gql`,
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '~@nyots/data-source',
      },
      config: {
        addExplicitOverride: true,
        typesPrefix: 'I',
        skipTypename: true,
      },
    },
  },
  overwrite: true,
};
export default config;
