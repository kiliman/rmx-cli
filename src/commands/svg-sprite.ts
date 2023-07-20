import * as fs from 'node:fs'
import * as path from 'node:path'
// @ts-expect-error
import svgParser from '../libs/svg-parser'

let rootFolder = ''
let outputFolder = ''
let outputFilename = 'index.tsx'
let template: string | null = null
let namedComponents = false

export default function (args: string[]) {
  // verify arguments
  if (args.length >= 2) {
    rootFolder = normalizeFolder(args[0])
    let outputPath = args[1]
    // if output folder has extension, then treat this as the base name
    if (outputPath.endsWith('.tsx')) {
      outputFolder = path.dirname(outputPath)
      outputFilename = path.basename(outputPath)
    } else {
      outputFolder = normalizeFolder(outputPath)
    }
    for (let i = 2; i < args.length; i++) {
      if (args[i].startsWith('--template=')) {
        const templateFilename = args[i].substring('--template='.length)
        template = fs.readFileSync(templateFilename, 'utf8')
      } else if (args[i] === '--components') {
        namedComponents = true
      }
    }
  } else {
    console.log(
      'Usage: npx rmx-cli svg-sprite SOURCE_FOLDER OUTPUT_PATH [--components] [--template=TEMPLATE_FILE]',
    )
    console.log('  SOURCE_FOLDER: folder containing .svg files')
    console.log('  OUTPUT_PATH: output path for sprite file and components')
    console.log(
      '    if OUTPUT_PATH ends with .tsx, then use this as the base filename',
    )
    console.log('   --components: generate named components for each icon')
    console.log('  --template=TEMPLATE_FILE: use custom template file')
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
  logs.forEach(args => console.log(...args))
  logs.length = 0
}

function normalizeFolder(folder: string) {
  let fullPath = path.resolve(folder)
  // remove cwd from path and leading slash
  let normalized = fullPath.replace(process.cwd(), '').substring(1)
  return normalized
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
    path.basename(outputFilename, '.tsx') + '.svg',
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

  generateReactComponent(spriteOutputFolder, files)
}

function generateReactComponent(spriteOutputFolder: string, files: string[]) {
  let icons = files.map(file => path.basename(file, '.svg'))
  const spritePath = path.basename(outputFilename, '.tsx') + '.svg'
  let component =
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
  // add type IconName for each icon file
  component += `
export const iconNames = [
${icons.map(icon => `  "${icon}",`).join('\n')}
] as const;
export type IconName = typeof iconNames[number];`

  icons.forEach(icon => log(`✅ ${icon}`))

  // if user wants named components, generate them
  if (namedComponents) {
    icons.forEach(icon => {
      // convert kebab case to title case
      const componentName = icon.replace(/(^|-)([a-z0-9])/g, g =>
        g!.at(-1)!.toUpperCase(),
      )
      component += `
export const ${componentName}Icon = (props: SVGProps<SVGSVGElement>) => <Icon icon="${icon}" {...props} />;`
    })
  }
  const componentOutput = path.join(spriteOutputFolder, outputFilename)
  component = component.trim()

  const exists = fs.existsSync(componentOutput)
  let hasChanges = !exists // if sprite doesn't exist, then we have changes
  if (exists) {
    // read existing sprite file
    const existingComponent = fs.readFileSync(componentOutput, 'utf8')
    if (existingComponent !== component) {
      hasChanges = true
    }
  }
  if (hasChanges) {
    // write sprite file
    fs.writeFileSync(componentOutput, component, 'utf8')
    flushLogs()
  }
}
