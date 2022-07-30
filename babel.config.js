module.exports = api => {
  const isProduction = process.env.NODE_ENV === `production`
  const fastRefresh = false

  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets: [
      `@babel/preset-env`,
      `@babel/preset-typescript`,
      [
        `@babel/preset-react`,
        {
          development: !isProduction,
          // runtime: `automatic`,
        },
      ],
    ],
    plugins: [!isProduction && fastRefresh && `react-refresh/babel`].filter(Boolean),
    compact: false,
  }
}
