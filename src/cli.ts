#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

main().catch(console.error)

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: npx rmx-cli <command>')
    process.exit(1)
  }
  const cliPath = path.dirname(fs.realpathSync(process.argv[1]))
  const commandName = process.argv[2]

  if (!fs.existsSync(path.join(cliPath, 'commands', `${commandName}.js`))) {
    console.error('Unknown command: ' + commandName)
    process.exit(1)
  }

  // add file:// prefix for windows imports
  const commandPath =
    'file://' + path.join(cliPath, 'commands', `${commandName}.js`)
  const command = (await import(commandPath)).default
  const args = process.argv.slice(3)
  await command.default(args)
}
