import * as path from 'path'
import fs from 'fs/promises'
import inquirer from 'inquirer'
import { constants } from 'fs'
import prettier from 'prettier'
import { Context } from '../context'

export type NewCommandType = 'route'

type NewCommandArgs = {
  type: NewCommandType
  name: string | undefined
  meta: boolean
  links: boolean
  loader: boolean
  action: boolean
  catchBoundary: boolean
  errorBoundary: boolean
  layout: boolean
  pathless: boolean
  handle: boolean
  overwrite: boolean
}

type NewRouteDescriptor = {
  file: string
  path: string
}

export default async function (args: NewCommandArgs, context: Context) {
  let { type, name } = args

  if (!name) {
    name = await inquirer
      .prompt({
        type: 'input',
        message: 'Name of the route',
        name: 'name',
        validate: value => {
          if (!value) {
            return 'Name is required'
          }
          if (value.includes('/')) {
            return 'Name cannot contain slashes'
          }

          // some arbitrary length limit
          if (value.length > 30) {
            return 'Name cannot be longer than 30 characters'
          }
          return true
        },
      })
      .then(res => res.name as string)
  }

  console.log(`🔨 Creating new route...`)

  let cwd = process.cwd()
  let routesDir = resolveRouteDir(cwd, context)

  const templates = make(type, name as string, args, routesDir)

  const templatesWithExisting = await Promise.all(
    templates.map(async template => ({
      ...template,
      exists: await fs
        .access(template.path, constants.F_OK)
        .then(() => true)
        .catch(() => false),
    })),
  )

  let shouldOverwrite =
    args.overwrite &&
    (await inquirer
      .prompt({
        type: 'confirm',
        message: 'Are you sure you want to overwrite existing files?',
        name: 'overwrite',
        default: false,
      })
      .then(res => res.overwrite as boolean))

  if (
    !shouldOverwrite &&
    templatesWithExisting.some(template => template.exists)
  ) {
    templatesWithExisting
      .filter(template => template.exists)
      .forEach(template => {
        console.log(`${template.path} already exists`)
      })
    process.exit(1)
  }

  await write(templates)

  console.log(
    `🎉 Created ${templates.length} file${templates.length > 1 ? 's' : ''}`,
  )

  templatesWithExisting.forEach(template => {
    console.log(
      `    ${template.path}${template.exists ? ' (overwritten)' : ''}`,
    )
  })
}

async function write(routes: NewRouteDescriptor[]) {
  return await Promise.all(
    routes.map(async descriptor => {
      await fs
        .mkdir(path.dirname(descriptor.path), { recursive: true })
        .catch(() => {
          // ignore if already exists
        })
      await fs.writeFile(descriptor.path, descriptor.file)
    }),
  )
}

function make(
  // for now, we only support one type of new command
  _type: NewCommandType,
  name: string,
  args: NewCommandArgs,
  dir: string,
): NewRouteDescriptor[] {
  let file = generateRoute(name, args)

  return args.layout
    ? [
        {
          path: path.resolve(dir, `${args.pathless ? '__' : ''}${name}.tsx`),
          file: file,
        },
        {
          path: path.resolve(
            dir,
            `${args.pathless ? `__` : ''}${name}/index.tsx`,
          ),
          file: generateRoute(`${name}-index`, args),
        },
      ]
    : [
        {
          path: path.resolve(dir, `${name}.tsx`),
          file: file,
        },
      ]
}

function resolveRouteDir(cwd: string, context: Context) {
  let appDir = path.join(
    context.basePath,
    context.remixConfig.appDirectory ?? 'app',
  )
  let routesDir = path.join(appDir, 'routes')
  let isInRoutesDir = cwd.startsWith(routesDir)
  let dir = isInRoutesDir ? cwd : routesDir
  return dir
}

function generateRoute(name: string, args: NewCommandArgs) {
  let typeImports = [
    args.action && 'ActionFunction',
    args.loader && 'LoaderFunction',
    args.links && 'LinksFunction',
    args.meta && 'MetaFunction',
  ]
    .filter(Boolean)
    .join(', ')

  let reactImports = [
    args.catchBoundary && 'useCatch',
    args.loader && 'useLoaderData',
    args.action && 'useActionData',
  ]
    .filter(Boolean)
    .join(', ')

  return prettier.format(
    `${
      typeImports
        ? `import type { ${typeImports} } from "@remix-run/node";`
        : ''
    }
  ${args.loader ? `import { json } from "@remix-run/node";` : ''}
  ${reactImports ? `import { ${reactImports} } from "@remix-run/react";` : ''}

  ${
    args.meta
      ? `export const meta: MetaFunction = () => ({
    title: '${name}',
  });`
      : ''
  }
  ${args.links ? `export const links: LinksFunction = () => [];` : ''}
  ${args.handle ? `export const handle = {};` : ''}
  ${
    args.loader
      ? `type LoaderData = {};
  
  export const loader: LoaderFunction = async ({ request, params }) => {
    return json<LoaderData>({})
  };`
      : ''
  }

  ${
    args.action
      ? `type ActionData = {};
  
  export const action: ActionFunction = async ({ request, params }) => {
    return json<ActionData>({})
  };`
      : ''
  }
  
  export default function ${pascalCase(normalizeName(name))}Page() {
    ${args.loader ? `const data = useLoaderData() as LoaderData;` : ''}
    ${args.action ? `const actionData = useActionData() as ActionData;` : ''}
  
    return (
      <div>
        ${name} works
      </div>
    );
  }
  
  ${
    args.errorBoundary
      ? `export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return <div>An unexpected error occurred: {error.message}</div>;
  };`
      : ''
  }

  ${
    args.catchBoundary
      ? `export function CatchBoundary() {
    const caught = useCatch();
  
    if (caught.status === 404) {
      return <div>not found</div>;
    }
  
    throw new Error(\`Unexpected caught response with status: \${caught.status}\`);
  };`
      : ''
  }`,
    {
      parser: 'typescript',
    },
  )
}

function pascalCase(str: string) {
  const camelCase = str.replace(/[-_]+(\w)/g, (_, c) => c.toUpperCase())
  return camelCase[0].toUpperCase() + camelCase.slice(1)
}

function normalizeName(name: string) {
  // if the name has dots, then its a nested route
  // so we just use the last part as the name
  // if the name has a $, then its a parameter
  // so we just remove the $ and use the rest as the name
  return name.replace(/\$/g, '').split('.').pop()!
}
