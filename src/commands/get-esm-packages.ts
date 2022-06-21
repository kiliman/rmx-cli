import { ArgumentsCamelCase, Argv } from 'yargs'
import { RmxCommand } from '../types/command'

let command: RmxCommand = {
  name: 'get-esm-packages <packages..>',
  description:
    'Scan for ESM package to add to remix.config.js serverDependenciesToBundle',
  builder,
  handler,
}

export default command

function handler(_args: ArgumentsCamelCase) {
  let args = _args as unknown as { packages: string[] }
  let esmPackages: Set<string> = new Set()

  function getDependencies(packageName: string) {
    const packageJson = require(`${packageName}/package.json`)

    if (packageJson.type === 'module') {
      if (esmPackages.has(packageName)) return
      console.log(`📦 ${packageName}`)
      esmPackages.add(packageName)
      const dependencies = packageJson.dependencies || {}
      Object.keys(dependencies).forEach(dependency => {
        getDependencies(dependency)
      })
    }
  }

  args.packages.forEach(packageName => {
    getDependencies(packageName)
  })

  console.log(
    '\n🔨 Add the following dependencies to your serverDependenciesToBundle\n',
  )
  console.log(
    Array.from(esmPackages.values())
      .sort()
      .map((packageName: string) => `"${packageName}"`)
      .join(',\n'),
  )
}

function builder(yargs: Argv) {
  return yargs.positional('packages', {
    desc: 'Packages to scan for ESM dependencies',
    default: [] as string[],
    array: true,
  })
}
