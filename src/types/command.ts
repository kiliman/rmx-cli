import { ArgumentsCamelCase, Argv } from 'yargs'
import { Context } from '../context'

export type RmxCommand = {
  name: string
  description: string
  builder?: (yargs: Argv<{}>) => Argv<{}>
  handler: (
    args: ArgumentsCamelCase<Record<string, unknown>>,
    context: Context,
  ) => any
}

// TODO: How to describe a remote command
export type RemoteRmxCommand = {
  href: string
}
