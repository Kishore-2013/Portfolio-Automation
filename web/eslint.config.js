export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
