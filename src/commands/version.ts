import * as fs from 'node:fs'

export default function (args: string[]) {
  // read package.json
  const packageJsonFilename = `./package.json`
  const packageJson = fs.readFileSync(packageJsonFilename, 'utf8')
  const packageJsonParsed = JSON.parse(packageJson)

  // get all dependencies
  const allDependencies = [
    ...Object.keys(packageJsonParsed.dependencies || {}),
    ...Object.keys(packageJsonParsed.devDependencies || {}),
  ]
  // filter @remix-run/* and react-router* packages
  const re = /^(remix|@remix-run\/\w+|react-router(-dom)?)$/
  const filteredDependencies = allDependencies.filter(packageName =>
    re.test(packageName),
  )

  filteredDependencies.forEach(packageName => {
    const version = getVersion(packageName)
    if (version) {
      console.log(`📦 ${packageName} version: ${version}`)
    }
  })

  function getVersion(packageName: string) {
    const packageJsonFilename = `./node_modules/${packageName}/package.json`
    if (!fs.existsSync(packageJsonFilename)) {
      console.log(`⚠️ ${packageName} package.json not found`)
      return
    }
    const json = fs.readFileSync(packageJsonFilename, 'utf8')
    const packageJson = JSON.parse(json)

    return packageJson.version
  }
}
