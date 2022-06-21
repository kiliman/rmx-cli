import { RmxCommand } from '../types/command'
import EjectRas from './eject-ras'
import GetEsmPackages from './get-esm-packages'
import New from './new'

let commands: RmxCommand[] = [EjectRas, GetEsmPackages, New]

export default commands
