#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import type { NewCommandType } from './commands/new'

main().catch(console.error)

async function main() {
  let context = await import('./context').then(m => m.getContext())

  await yargs(hideBin(process.argv))
    .scriptName('rmx')
    .command(
      'eject-ras',
      'Eject your Remix project from Remix App Server to Express',
      async () => {
        let command = (await import('./commands/eject-ras')).default
        await command()
      },
    )
    .command(
      'get-esm-packages <packages..>',
      'Scan for ESM package to add to remix.config.js serverDependenciesToBundle',
      yargs => {
        return yargs.positional('packages', {
          desc: 'Packages to scan for ESM dependencies',
          default: [] as string[],
          array: true,
        })
      },
      async args => {
        let command = (await import('./commands/get-esm-packages')).default

        command(args.packages)
      },
    )
    .command(
      'new [type] [name]',
      'Create a new Remix route',
      yargs =>
        yargs
          .positional('type', {
            type: 'string',
            choices: ['route'],
            default: 'route' as NewCommandType,
          })
          .positional('name', {
            type: 'string',
          })
          .option('meta', {
            boolean: true,
            default: true,
            alias: 'm',
          })
          .option('links', {
            boolean: true,
            default: true,
            alias: 'ls',
          })
          .option('loader', {
            boolean: true,
            default: true,
            alias: 'l',
          })
          .option('action', {
            boolean: true,
            default: true,
            alias: 'a',
          })
          .option('catchBoundary', {
            boolean: true,
            default: true,
            alias: 'cb',
          })
          .option('errorBoundary', {
            boolean: true,
            default: true,
            alias: 'eb',
          })
          .option('layout', {
            boolean: true,
            default: false,
            alias: 'ly',
          })
          .option('pathless', {
            boolean: true,
            default: false,
            alias: 'pl',
          })
          .option('handle', {
            boolean: true,
            default: false,
            alias: 'h',
          })
          .option('overwrite', {
            boolean: true,
            default: false,
            alias: 'o',
          }),

      async args => {
        let command = await import('./commands/new').then(m => m.default)

        await command(args, context)
      },
    )
    .demandCommand()
    .recommendCommands()
    .help().argv
}
