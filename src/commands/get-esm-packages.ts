export default function (args: string[]) {
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

  args.forEach(packageName => {
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
