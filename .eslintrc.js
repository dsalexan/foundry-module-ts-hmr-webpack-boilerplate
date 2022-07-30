// process.env.NODE_ENV = process.env.NODE_ENV || `development`
// process.env.BABEL_ENV = process.env.BABEL_ENV || `development`

const fs = require(`fs`)
const path = require(`path`)

const prettierOptions = JSON.parse(fs.readFileSync(path.resolve(__dirname, `.prettierrc`), `utf8`))

// module.exports = {
//   // parserOptions: {
//   //   ecmaVersion: 2020,
//   //   extraFileExtensions: [`.cjs`, `.mjs`],
//   //   sourceType: `module`,
//   //   project: `./tsconfig.eslint.json`,
//   // },
//   extends: [`prettier`],
//   plugins: [`prettier`],
//   rules: {
//     "prettier/prettier": [`error`, prettierOptions],
//     quotes: [`warn`, `backtick`],
//     // "@typescript-eslint/no-var-requires": `off`,
//     // "@typescript-eslint/ban-types": `off`,
//     // "@typescript-eslint/no-namespace": `off`,
//   },
//   overrides: [
//     {
//       files: [`**/*.ts?(x)`],
//       rules: { "prettier/prettier": [`warn`, prettierOptions] },
//     },
//   ],
// }

module.exports = {
  parserOptions: {
    ecmaVersion: `latest`,
    sourceType: `module`,
  },

  env: {
    es6: true,
    node: true,
  },

  extends: [`prettier`],
  plugins: [`prettier`, `json`],
  rules: {
    "prettier/prettier": [`error`, prettierOptions],
    //
    "json/*": [`error`, `allowComments`],
    //
    quotes: [`warn`, `backtick`],
    "no-undef": [`error`],
  },
  overrides: [
    {
      files: [`**/*.ts`, `**/*.tsx`, `**/*.mjs`],
      parser: `@typescript-eslint/parser`,

      extends: [`eslint:recommended`, `plugin:@typescript-eslint/recommended`, `prettier`],
      plugins: [`@typescript-eslint`],

      parserOptions: {
        extraFileExtensions: [`.mjs`],
        ecmaVersion: `latest`,
        sourceType: `module`,
      },

      env: {
        browser: true,
        es2021: true,
        commonjs: false,
        node: true,
      },

      rules: {
        "@typescript-eslint/no-var-requires": `off`,
        "@typescript-eslint/ban-types": `off`,
        "@typescript-eslint/no-namespace": `off`,

        "@typescript-eslint/no-unused-vars": [1, { argsIgnorePattern: `^_` }],
        "@typescript-eslint/no-empty-function": [0],
        "@typescript-eslint/explicit-module-boundary-types": `off`,
        "@typescript-eslint/ban-ts-comment": `off`,
        "@typescript-eslint/no-explicit-any": `off`,
        "@typescript-eslint/no-non-null-assertion": `off`,
      },
    },
  ],
}
