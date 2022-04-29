#!/usr/bin/env node

import * as path from 'path'

main().catch(console.error)

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: npx rmx <command>')
    process.exit(1)
  }
  const cliPath = path.dirname(process.argv[1])
  const commandName = process.argv[2]
  const command = (
    await import(path.resolve(cliPath, `./commands/${commandName}.js`))
  ).default
  await command.default()
}
