module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    requireConfigFile: false,
  },
  plugins: [
    "lodash-fp",
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:lodash-fp/recommended",
  ],
  // add your custom rules here
  rules: {
    "no-lone-blocks": "off",
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": [ "error" ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        caughtErrors: "none",
      },
    ],
    "lodash-fp/prefer-constant": "warn",
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-var-requires": "off",
    "nuxt/no-cjs-in-config": "off",
    "space-before-function-paren": [
      "error", {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
    indent: "off",
    "@typescript-eslint/indent": "off",
    "array-bracket-spacing": [ "error", "always" ],
    "arrow-parens": [ "error", "always" ],
    "arrow-spacing": "error",
    camelcase: [
      "error",
      {
        ignoreDestructuring: true,
      },
    ],
    "comma-dangle": [ "error", "always-multiline" ],
    "comma-spacing": [
      "error",
      {
        before: false,
        after: true,
      },
    ],
    "comma-style": [ "error", "last" ],
    "computed-property-spacing": [ "error", "never" ],
    "dot-notation": "error",
    eqeqeq: [ "error", "always" ],
    "guard-for-in": "error",
    "linebreak-style": [ "error", "unix" ],
    "lines-between-class-members": [ "error", "always" ],
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-mixed-operators": "error",
    "no-multi-assign": "error",
    "no-multiple-empty-lines": [
      "error",
      {
        max: 2,
        maxEOF: 1,
        maxBOF: 1,
      },
    ],
    "no-console": "warn",
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-tabs": "warn",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-assign": [ "error", "always" ],
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": [ "error" ],
    "object-curly-newline": [
      "error", {
        ImportDeclaration: "always",
      },
    ],
    "object-shorthand": [ "error", "always" ],
    "operator-linebreak": [
      "error",
      "before",
      {
        "overrides": {
          "=": "after",
          "+=": "after",
          "-=": "after",
          "??=": "after",
          "&&=": "after",
          "||=": "after",
        },
      },
    ],
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "prefer-destructuring": [
      "warn",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "prefer-numeric-literals": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    semi: [ "error", "always" ],
    "space-before-blocks": [ "warn", "always" ],
    "space-infix-ops": "error",
    "template-curly-spacing": [ "error", "always" ],
    "template-tag-spacing": [ "error", "never" ],
    "wrap-iife": [ "error", "inside" ],
    yoda: [ "error", "always", { exceptRange: true } ],
  },
};
