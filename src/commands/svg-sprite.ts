import * as fs from 'node:fs'
import * as path from 'node:path'
// @ts-expect-error
import svgParser from '../libs/svg-parser'

let rootFolder = ''
let outputFolder = ''
let template: string | null = null
let namedComponents = false
let component = 'icon.tsx'
let sprite = 'icon.svg'
let types = ''

export default function (args: string[]) {
  // verify arguments
  if (args.length >= 2) {
    rootFolder = normalizeFolder(args[0])
    let outputPath = args[1]
    // if output folder has extension, then treat this as the base name
    if (outputPath.endsWith('.tsx')) {
      outputFolder = path.dirname(outputPath)
      component = path.basename(outputPath)
    } else {
      outputFolder = normalizeFolder(outputPath)
    }
    for (let i = 2; i < args.length; i++) {
      if (args[i].startsWith('--template=')) {
        const templateFilename = args[i].substring('--template='.length)
        template = fs.readFileSync(templateFilename, 'utf8')
      } else if (args[i].startsWith('--component=')) {
        sprite = args[i].substring('--component='.length)
      } else if (args[i].startsWith('--sprite=')) {
        sprite = args[i].substring('--sprite='.length)
      } else if (args[i].startsWith('--types=')) {
        types = args[i].substring('--types='.length)
      } else if (args[i] === '--components') {
        namedComponents = true
      }
    }
  } else {
    console.log(
      `
Usage: npx rmx-cli svg-sprite SOURCE_FOLDER OUTPUT_PATH
               [--sprite=FILENAME] [--types=FILENAME]
               [--components] [--template=TEMPLATE_FILE]

SOURCE_FOLDER: folder containing .svg files
OUTPUT_PATH: output path for sprite file and components

* If OUTPUT_PATH ends with .tsx, then use this as the base filename
  (default: icon.tsx)

--sprite=FILENAME: base filename of sprite file (default: icon.svg)
--types=FILENAME : base filename of IconType export file
                   if present, will not generate component file
--components     : generate named components for each icon
--template=TEMPLATE_FILE: use custom template file
`.trimStart(),
    )
    process.exit(1)
  }

  // generate sprites for any .svg files in the root folder recursively
  generateSprites(rootFolder)
}

// queue up console.log calls so we can print them after files are "generated"
const logs: any[] = []
function log(...args: any[]) {
  logs.push(args)
}
function flushLogs() {
  if (logs.length === 0) return
  logs.forEach(args => console.log(...args))
  logs.length = 0
}

function normalizeFolder(folder: string) {
  let fullPath = path.resolve(folder)
  // remove cwd from path and leading slash
  const cwd = ensureSlash(process.cwd())
  let normalized = fullPath
  // check if normalized starts with cwd (both have to end with /, otherwise
  // the check might be wrong, e.g. /tmp/test is cwd and /tmp/test2 is fullPath)
  if (normalized.startsWith(cwd)) {
    normalized = normalized.replace(cwd, '')
  }
  return normalized
}

function ensureSlash(input: string): string {
  if (!input.endsWith(path.sep)) {
    input = input + path.sep
  }
  return input
}

function generateSprites(folder: string) {
  // any .svg files in this folder?
  const svgFiles = fs
    .readdirSync(folder)
    .filter(file => file.endsWith('.svg'))
    .map(file => path.join(folder, file))
  if (svgFiles.length > 0) {
    generateSprite(folder, svgFiles)
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

function generateSprite(folder: string, files: string[]) {
  // folder is something like: assets/svg/heroicons/20/solid
  // spriteOutputFolder: components/svg/heroicons/20/solid

  const spriteOutputFolder = folder.replace(rootFolder, outputFolder)

  const spriteOutput = path.join(
    spriteOutputFolder,
    path.basename(component, '.tsx') + '.svg',
  )

  log(`📝 Generating sprite for ${folder}`)

  // create output folder if it doesn't exist
  if (!fs.existsSync(spriteOutputFolder)) {
    fs.mkdirSync(spriteOutputFolder, { recursive: true })
  }
  const strip = true
  const trim = false

  let { svgElement } = svgParser.iterateFiles(files, strip, trim)

  svgElement = svgParser.wrapInSvgTag(svgElement)

  const exists = fs.existsSync(spriteOutput)
  let hasChanges = !exists // if sprite doesn't exist, then we have changes
  if (exists) {
    // read existing sprite file
    const existingSprite = fs.readFileSync(spriteOutput, 'utf8')
    if (existingSprite !== svgElement) {
      hasChanges = true
    }
  }
  if (hasChanges) {
    // write sprite file
    fs.writeFileSync(spriteOutput, svgElement, 'utf8')
    flushLogs()
  }

  if (types) {
    generateTypesFile(spriteOutputFolder, files)
    return
  }

  generateReactComponent(spriteOutputFolder, files)
}

function generateTypesFile(spriteOutputFolder: string, files: string[]) {
  let icons = files.map(file => path.basename(file, '.svg'))
  let output = `export const iconNames = [
${icons.map(icon => `  "${icon}",`).join('\n')}
] as const;

export type IconName = typeof iconNames[number];
`
  icons.forEach(icon => log(`✅ ${icon}`))

  let typesPath = path.join(spriteOutputFolder, types)
  const exists = fs.existsSync(typesPath)
  let hasChanges = !exists // if types doesn't exist, then we have changes
  if (exists) {
    // read existing types file
    const existing = fs.readFileSync(typesPath, 'utf8')
    if (existing !== output) {
      hasChanges = true
    }
  }
  if (hasChanges) {
    fs.writeFileSync(typesPath, output, 'utf8')
    flushLogs()
  }
}
function generateReactComponent(spriteOutputFolder: string, files: string[]) {
  let icons = files.map(file => path.basename(file, '.svg'))
  const spritePath = path.basename(component, '.tsx') + '.svg'
  let output =
    template ??
    `
import { type SVGProps } from "react";
import href from "./${spritePath}";
export { href };

export default function Icon({ icon, ...props}: SVGProps<SVGSVGElement> & { icon: IconName }) {
  return (
    <svg {...props}>
      <use href={\`\${href}#\${icon}\`} />
    </svg>
  );
}
`
  // if user didn't specify types file then inline them
  if (!types) {
    // add type IconName for each icon file
    output += `
export const iconNames = [
${icons.map(icon => `  "${icon}",`).join('\n')}
] as const;
export type IconName = typeof iconNames[number];`
  }
  icons.forEach(icon => log(`✅ ${icon}`))

  // if user wants named components, generate them
  if (namedComponents) {
    output += '\n';
    icons.forEach(icon => {
      // convert kebab case to title case
      const componentName = icon.replace(/(^|-|_)([a-z0-9])/g, g =>
        g!.at(-1)!.toUpperCase(),
      )
      output += `
export const ${componentName}Icon = (props: SVGProps<SVGSVGElement>) => <Icon icon="${icon}" {...props} />;`
    })
  }
  const componentPath = path.join(spriteOutputFolder, component)
  output = output.trimStart()

  const exists = fs.existsSync(componentPath)
  let hasChanges = !exists // if sprite doesn't exist, then we have changes
  if (exists) {
    // read existing sprite file
    const existing = fs.readFileSync(componentPath, 'utf8')
    if (existing !== output) {
      hasChanges = true
    }
  }
  if (hasChanges) {
    // write sprite file
    fs.writeFileSync(componentPath, output, 'utf8')
    flushLogs()
  }
}
