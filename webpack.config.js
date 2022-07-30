const fs = require(`fs`)
const path = require(`path`)
const webpack = require(`webpack`)
const resolve = require(`resolve`)
const glob = require(`glob`)
const { createHash } = require(`crypto`)

const ESLintPlugin = require(`eslint-webpack-plugin`)
const { CleanWebpackPlugin } = require(`clean-webpack-plugin`)
const CopyPlugin = require(`copy-webpack-plugin`)
const StringReplacePlugin = require(`string-replace-webpack-plugin`)
const ReplaceInFileWebpackPlugin = require(`replace-in-file-webpack-plugin`)
const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)
const TsconfigPathsPlugin = require(`tsconfig-paths-webpack-plugin`)
const VisualizerPlugin = require(`webpack-visualizer-plugin2`)

const globImporter = require(`node-sass-glob-importer`)

const ReactRefreshWebpackPlugin = require(`@pmmmwh/react-refresh-webpack-plugin`)
const ReactRefreshTypeScript = require(`react-refresh-typescript`)

const config = require(`./config`)

// Stablish paths beforehand
const DIRECTORY = fs.realpathSync(process.cwd())
const BUILD_PATH = path.resolve(DIRECTORY, `dist`)
const PACKAGE_JSON_PATH = path.resolve(DIRECTORY, `package.json`)
const APP_WEBPACK_CACHE_PATH = path.resolve(DIRECTORY, `node_modules/.cache`)
const TSCONFIG_PATH = path.resolve(DIRECTORY, `tsconfig.json`)

// style files regexes
const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== `false`
const fastRefresh = false

function createEnvironmentHash(env) {
  const hash = createHash(`md5`)
  hash.update(JSON.stringify(env))

  return hash.digest(`hex`)
}

module.exports = webpackEnv => {
  const env = {
    watch: false,
    mode: `development`,
    ...webpackEnv,
  }

  const isProduction = env.mode === `production`
  const isDevelopment = env.mode === `development`

  const webpackConfig = {
    entry: {
      reactRefreshSetup: `@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js`,
      [config.MODULE_ID]: `./src/index.ts`,
    },
    watch: env.watch,
    devtool: isProduction ? (shouldUseSourceMap ? `source-map` : false) : isDevelopment && `cheap-module-source-map`,
    stats: `minimal`,
    mode: env.mode,
    resolve: {
      extensions: [`.wasm`, `.mjs`, `.ts`, `.tsx`, `.js`, `.jsx`, `.json`],
      alias: {
        logger: path.resolve(DIRECTORY, `src/logger`),
        config: path.resolve(DIRECTORY, `config/`),
        app: path.resolve(DIRECTORY, `src/app/`),
        module: path.resolve(DIRECTORY, `src/module/`),
        lib: path.resolve(DIRECTORY, `src/lib/`),
      },
    },
    output: {
      filename: `[name].js`,
      path: path.resolve(__dirname, `dist`),
      publicPath: ``,
    },
    cache: {
      type: `filesystem`,
      version: createEnvironmentHash(process.env),
      cacheDirectory: APP_WEBPACK_CACHE_PATH,
      store: `pack`,
      buildDependencies: {
        defaultWebpack: [`webpack/lib/`],
        config: [__filename],
        tsconfig: [TSCONFIG_PATH],
      },
    },
    module: {
      rules: [
        isDevelopment
          ? {
              test: /\.html$/,
              loader: `raw-loader`,
            }
          : {
              test: /\.html$/,
              loader: `null-loader`,
            },
        {
          test: /\.tsx?$/,
          use: [
            {
              // loader: require.resolve(`babel-loader`),
              // options: {
              //   plugins: [isDevelopment && fastRefresh && require.resolve(`react-refresh/babel`)].filter(Boolean),
              // },
              loader: require.resolve(`ts-loader`),
              options: {
                getCustomTransformers: () => ({
                  before: [isDevelopment && fastRefresh && ReactRefreshTypeScript()].filter(Boolean),
                }),
                transpileOnly: isDevelopment,
              },
            },
            `webpack-import-glob-loader`,
            `source-map-loader`,
            {
              loader: StringReplacePlugin.replace({
                replacements: [
                  {
                    pattern: /("|'|`)__WEBPACK__ALL_TEMPLATES__("|'|`)/g,
                    replacement: () =>
                      glob
                        .sync(`**/*.{html}`, { cwd: path.join(__dirname, `static/templates`) })
                        .map(file => `"modules/template/templates/${file}"`)
                        .join(`, `),
                  },
                ],
              }),
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: `css-loader`,
              options: {
                sourceMap: isDevelopment,
                url: false,
              },
            },
            `postcss-loader`,
            {
              loader: `sass-loader`,
              options: {
                sourceMap: isDevelopment,
                sassOptions: {
                  importer: globImporter(),
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ESLintPlugin({
        extensions: [`ts`],
        emitError: false,
      }),
      new MiniCssExtractPlugin({
        filename: `[name].css`,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: `static`,
            noErrorOnMissing: true,
            // Terser skip these files
            info: file => ({ minimized: true }),
          },
        ],
      }),
      new ReplaceInFileWebpackPlugin([
        {
          dir: `dist`,
          files: [`module.json`],
          rules: [
            {
              search: /__WEBPACK__MODULE_ID__/g,
              replace: config.MODULE_ID,
            },
            {
              search: /__WEBPACK__MODULE_NAME__/g,
              replace: config.MODULE_NAME,
            },
            {
              search: /"__WEBPACK__BUNDLE_FILES__",/,
              replace: ``, //isDevelopment ? `"runtime.js",` : ``,
            },
          ].filter(Boolean),
        },
      ]),
      isDevelopment && fastRefresh && new ReactRefreshWebpackPlugin({ overlay: false }),
      isProduction && new VisualizerPlugin(),
    ].filter(Boolean),
    optimization: {
      minimize: false,
      // runtimeChunk: `single`,
      // Ensure `react-refresh/runtime` is hoisted and shared
      // Could be replicated via a vendors chunk
      splitChunks: {
        // name(_, __, cacheGroupKey) {
        //   return cacheGroupKey
        // },
        cacheGroups: {
          react: {
            chunks: `all`,
            test: /[\\/]node_modules[\\/](react|react-dom|@mui|@emotion)[\\/]/,
            name: `react`,
            filename: `js/[name].bundle.js`,
            reuseExistingChunk: true,
          },
          mdi: {
            chunks: `all`,
            test: /[\\/]node_modules[\\/](@mdi)[\\/]/,
            name: `mdi`,
            minSize: 1,
            filename: `js/[name].bundle.js`,
            reuseExistingChunk: true,
          },
        },
      },
    },
  }

  if (!isDevelopment) {
    delete webpackConfig.devServer
    delete webpackConfig.devtool
    delete webpackConfig.optimization.runtimeChunk
  }

  if (!isDevelopment || !fastRefresh) {
    delete webpackConfig.entry.reactRefreshSetup
  }

  return webpackConfig
}
