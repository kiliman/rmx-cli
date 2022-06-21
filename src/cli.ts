#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

main().catch(console.error)

// the intent is for this cli to eventually contain many pluggable commands
// there will be a set of base commands that we maintain
// and then remote commands that users of the CLI can add
async function main() {
  let context = await import('./context').then(m => m.getContext())
  let baseCommands = await import('./commands').then(m => m.default)
  // let conf = await import('conf').then(
  //   m =>
  //     new m.default({
  //       projectName: 'rmx-cli',
  //     }),
  // )
  // here we access the remote commands added by the user
  // this will be added by something like rmx add <command name>
  // let remoteCommands = conf.get('remote.commands', []) as RmxCommand[]
  let commands = baseCommands
  let init = yargs(hideBin(process.argv)).scriptName('rmx')

  // once we've gathered the commands, we can take advantage of yargs' builder api
  // we start off with the initial yargs configuration
  // and continously build with each command we have
  let cli = commands.reduce(
    (cli, command) =>
      cli.command(
        command.name,
        command.description,
        yargs => command.builder?.(yargs) ?? yargs,
        args => command.handler(args, context),
      ),
    init,
  )

  await cli.demandCommand().recommendCommands().help().argv
}
