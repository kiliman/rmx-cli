import * as fs from 'node:fs'
import * as path from 'node:path'
// @ts-expect-error
import svgParser from '../libs/svg-parser'

let rootFolder = ''
let outputFolder = ''
let namedComponents = false

export default function (args: string[]) {
  // verify arguments
  if (args.length >= 2) {
    rootFolder = normalizeFolder(args[0])
    outputFolder = normalizeFolder(args[1])
    if (args[2] === '--components') {
      namedComponents = true
    }
  } else {
    console.log(
      'Usage: npx rmx-cli svg-sprite SOURCE_FOLDER OUTPUT_FOLDER [--components]',
    )
    console.log('  SOURCE_FOLDER: folder containing .svg files')
    console.log('  OUTPUT_FOLDER: folder to write sprite.svg and index.tsx')
    console.log('   --components: generate named components for each icon')
    process.exit(1)
  }

  // generate sprites for any .svg files in the root folder recursively
  generateSprites(rootFolder)
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
  const spriteOutput = path.join(spriteOutputFolder, 'sprite.svg')

  console.log(`📝 Generating sprite for ${folder}`)

  // create output folder if it doesn't exist
  if (!fs.existsSync(spriteOutputFolder)) {
    fs.mkdirSync(spriteOutputFolder, { recursive: true })
  }
  const strip = true
  const trim = false

  let { svgElement } = svgParser.iterateFiles(files, strip, trim)

  svgElement = svgParser.wrapInSvgTag(svgElement)
  svgParser.writeIconsToFile(spriteOutput, svgElement)

  // delete old sprite.d.ts file if it exists
  const typesFilename = path.join(spriteOutputFolder, 'sprite.d.ts')
  if (fs.existsSync(typesFilename)) {
    fs.unlinkSync(typesFilename)
  }

  generateReactComponent(spriteOutputFolder, files)
}

function generateReactComponent(spriteOutputFolder: string, files: string[]) {
  let icons = files.map(file => path.basename(file, '.svg'))
  let component = `
import { type SVGProps } from "react";
import href from "./sprite.svg";
export { href };

export default function Icon({ icon, ...props}: SVGProps<SVGSVGElement> & { icon: IconName }) {
  return (
    <svg {...props}>
      <use href={\`\${href}#\${icon}\`} />
    </svg>
  );
}

type IconName =
${icons.map(icon => `  | "${icon}"`).join('\n')}
`
  icons.forEach(icon => console.log(`✅ ${icon}`))

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
  fs.writeFileSync(path.join(spriteOutputFolder, 'index.tsx'), component.trim())
  console.log()
}
