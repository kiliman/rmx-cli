import { spawn } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

let rootFolder = ''
let outputFolder = ''

export default function (args: string[]) {
  // verify arguments
  if (args.length >= 2) {
    rootFolder = normalizeFolder(args[0])
    outputFolder = normalizeFolder(args[1])
  } else {
    console.log('Usage: npx rmx-cli svg-sprite <rootFolder> <outputFolder>')
    process.exit(1)
  }

  // generate sprites for any .svg files in the root folder recursively
  generateSprites(rootFolder)
}

function normalizeFolder(folder: string) {
  let fullPath = path.resolve(folder)
  // remove cwd from path and leading slash
  let normalized = fullPath.replace(process.cwd(), '').substring(1)
  console.log({ fullPath, normalized })
  return normalized
}

function generateSprites(folder: string) {
  // any .svg files in this folder?
  if (fs.readdirSync(folder).some(file => file.endsWith('.svg'))) {
    generateSprite(folder)
  }

  // recurse through folders looking for .svg files
  const folders = fs
    .readdirSync(folder, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(folder, dirent.name))

  folders.forEach(folder => {
    generateSprites(folder)
  })
}

function generateSprite(folder: string) {
  // folder is something like: assets/svg/heroicons/20/solid
  // spriteOutputFolder: components/svg/heroicons/20/solid

  const spriteOutputFolder = folder.replace(rootFolder, outputFolder)
  const spriteOutput = path.join(spriteOutputFolder, 'sprite.svg')

  console.log(`📝 Generating sprite for ${folder}`)

  // create output folder if it doesn't exist
  if (!fs.existsSync(spriteOutputFolder)) {
    fs.mkdirSync(spriteOutputFolder, { recursive: true })
  }

  // generate sprite via svg-icon-generate CLI
  const child = spawn(
    'npx',
    ['svg-icon-generate', `--folder=${folder}`, `--output=${spriteOutput}`],
    { shell: true },
  )

  // create the sprite.d.ts file
  const typesFilename = path.join(spriteOutputFolder, 'sprite.d.ts')
  const typesFile = fs.createWriteStream(typesFilename)

  // convert the output folder to a namespace (path separators to underscores)
  const namespace = spriteOutputFolder
    .replace(outputFolder, '')
    .replace(/[\/\\]/g, '_')
    .substring(1) // remove leading underscore

  typesFile.write(`declare namespace ${namespace} {\n`)
  typesFile.write('  export type IconIds =\n')

  child.stdout.on('data', data => {
    // get the sprite id from the CLI output
    // and write to the types file
    const lines = data.toString().split('\n') as string[]
    lines.forEach(line => {
      const match = line.match(/Created SVG symbol from (.+)/)
      if (match) {
        // strip color codes
        const id = match[1].replace(/[\x1b]\[\d+m/g, '')
        typesFile.write(`    | "${id}"\n`)
        console.log(`✅ ${id}`)
      }
    })
  })

  child.stderr.on('data', data => {
    console.error(`❌: ${data}`)
  })

  child.on('close', code => {
    typesFile.write(`}\n`)
    typesFile.close()
    generateReactComponent(spriteOutputFolder, namespace)
  })
}

function generateReactComponent(spriteOutputFolder: string, namespace: string) {
  const component = `
import href from "./sprite.svg";
export { href };

export default function Icon({
  id,
  className,
}: {
  id: ${namespace}.IconIds;
  className?: string;
}) {
  return (
    <svg className={className}>
      <use href={\`\${href}#\${id}\`} />
    </svg>
  );
}
    `.trim()

  fs.writeFileSync(path.join(spriteOutputFolder, 'index.tsx'), component)
}
