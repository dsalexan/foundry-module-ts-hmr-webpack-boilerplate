// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = `development`
process.env.NODE_ENV = `development`

const PORT = process.env.PORT || 30000
const HOST = process.env.HOST || `0.0.0.0`
process.env.PUBLIC_URL = process.env.PUBLIC_URL || `localhost:${PORT}`

const path = require(`path`)
const fs = require(`fs`)
const webpack = require(`webpack`)
const WebpackDevServer = require(`webpack-dev-server`)

const chalk = require(`react-dev-utils/chalk`)
const clearConsole = require(`react-dev-utils/clearConsole`)
const { createCompiler, prepareUrls } = require(`react-dev-utils/WebpackDevServerUtils`)
const openBrowser = require(`react-dev-utils/openBrowser`)

const webpackConfig = require(`../webpack.config`)

const isInteractive = process.stdout.isTTY

if (process.env.HOST) {
  console.log(chalk.cyan(`Attempting to bind to HOST environment variable: ${chalk.yellow(chalk.bold(process.env.HOST))}`))
  console.log(`If this was unintentional, check that you haven't mistakenly set it in your shell.`)
  console.log(`Learn more here: ${chalk.yellow(`https://cra.link/advanced-config`)}`)
  console.log()
}

// Stablish paths beforehand
const DIRECTORY = fs.realpathSync(process.cwd())
const BUILD_PATH = path.resolve(DIRECTORY, `dist`)
const PACKAGE_JSON_PATH = path.resolve(DIRECTORY, `package.json`)

const config = webpackConfig({
  watch: false,
  mode: `development`,
})

try {
  const protocol = process.env.HTTPS === `true` ? `https` : `http`

  const urls = prepareUrls(protocol, HOST, PORT, ``)

  // Create a webpack compiler that is configured with custom messages.
  const compiler = createCompiler({
    appName: require(PACKAGE_JSON_PATH).name,
    config,
    urls,
    useYarn: true,
    useTypeScript: true,
    webpack,
  })

  const devServer = new WebpackDevServer(
    {
      hot: true,
      liveReload: true,
      devMiddleware: {
        writeToDisk: true,
      },
      client: {
        overlay: {
          warnings: false,
          errors: false,
        },
      },
    },
    compiler,
  )

  // Launch WebpackDevServer.
  devServer.startCallback(() => {
    if (isInteractive) clearConsole()

    console.log(chalk.cyan(`Starting the development server...\n`))
    // openBrowser(urls.localUrlForBrowser)
    openBrowser(`http://localhost:30000/game`)
  })
  ;[`SIGINT`, `SIGTERM`].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close()
      process.exit()
    })
  })

  if (process.env.CI !== `true`) {
    // Gracefully exit when stdin ends
    process.stdin.on(`end`, function () {
      devServer.close()
      process.exit()
    })
  }
} catch (err) {
  if (err && err.message) {
    console.log(err.message)
  }
  process.exit(1)
}
