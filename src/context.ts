import * as path from 'path'

export type Context = {
  basePath: string
  // TODO: type these
  remixConfig: any
  packageJson: any
}

export const getContext = async (): Promise<Context> => {
  let findUp = await import('find-up').then(m => m.findUp)
  let remixConfigPath = await findUp('remix.config.js')
  if (!remixConfigPath) {
    console.log('Could not find a remix.config.js file')
    console.log('You must be in a remix directory')
    process.exit(1)
  }
  let basePath = path.dirname(remixConfigPath)
  let context = {
    remixConfig: require(remixConfigPath),
    basePath,
    // we have a reasonable assumption that the package.json is in the same
    // directory as the remix.config.js
    packageJson: require(path.join(basePath, 'package.json')),
  }
  return context
}
