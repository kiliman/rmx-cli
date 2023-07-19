# rmx-cli

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

A CLI tool for Remix applications. Future versions will support adding external
commands.

## 🛠 Installation

```bash
npm install -D rmx-cli
```

# Commands

## 🎁 svg-sprite ✨ NEW

Generate SVG sprites recursively from `SOURCE_FOLDER`. It generates the sprite file,
as well as a React component to create the icon by specifying the fully-typed icon name.
It also exports the `href` of the sprite file to use in the Remix `links` export.

The `OUTPUT_PATH` can be a folder or a filename. If it is a filename, that will be used
as the base name if there are multiple source folders. For example:
_components/icons/icon.tsx_ will generate an _icons.tsx_ and _icons.svg_ file for every
source folder.

If you want to generate a React component for _each_ icon, then add the `--components`
argument. Then you can import the named icon directly.

> NOTE: The React component name will be the filename in TitleCase

You can specify a custom template file that will be used as the base for the generated
React component. The typed `IconNames` and exported components will be be appended to this
template file.

Here's a sample template file:

```ts
import { type SVGProps } from 'react'
import { cn } from '~/utils/misc'
import href from './sprite.svg'
export { href }

const sizeClassName = {
  font: 'w-font h-font',
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
} as const

type Size = keyof typeof sizeClassName

export default function Icon({
  icon,
  size = 'font',
  className,
  ...props
}: SVGProps<SVGSVGElement> & { icon: IconName; size?: Size }) {
  return (
    <svg
      {...props}
      className={cn(sizeClassName[size], 'inline self-center', className)}
    >
      <use href={`${href}#${icon}`} />
    </svg>
  )
}
```

```bash
npx rmx-cli svg-sprite SOURCE_FOLDER OUTPUT_PATH [--components] [--template=TEMPLATE_FILE]
```

### Usage

_Example:_

```bash
npx rmx-cli svg-sprite assets/svg app/components/icons
```

```ts
// import default Icon component and specify the icon by name
// import the href to the sprite file to use in `links` export
import {
  default as RadixIcon,
  href as radixIcons,
} from "~/components/radixicons";

<RadixIcon icon="bookmark" className="text-red-500 h-6 w-6" />
<RadixIcon icon="envelope-open" className="text-green-500 h-6 w-6" />

// OR import named icon components (using --components flag)
import {
  ArchiveBoxIcon,
  ArrowDownIcon,
  CakeIcon,
  href as outline24Icons,
} from "~/components/heroicons/24/outline";

// generate <link rel="preload"> for the sprite file
export const links: LinksFunction = () => [
  { rel: "preload", href: outline24Icons, as: "image" },
  { rel: "stylesheet", href: tailwindCss },
];

// control color and size using className
<ArchiveBoxIcon className="text-red-500 h-6 w-6" />
<ArrowDownIcon className="text-green-500 h-6 w-6" />
<CakeIcon className="text-blue-500 h-6 w-6" />
```

<img src="./images/svg-sprite.png" style="max-width:400px">

## 🪂 eject-ras

Eject your Remix project from Remix App Server to Express

```bash
npx rmx-cli eject-ras
```

## 📦 get-esm-packages

Scan for ESM package to add to _remix.config.js_ `serverDependenciesToBundle`

```bash
npx rmx-cli get-esm-packages [package-name ...]
```

### Usage

```bash
  Example:
    npx rmx-cli get-esm-packages @remix-run/node @remix-run/react
```

## 🏷️ version

List all Remix package versions installed in node_modules

```bash
npx rmx-cli version
```

## 🚀 gen-remix

THis script will generate a _remix.ts_ file which re-exports all exports
from specified packages. This essentially works like the _magic_ `remix`
package from early Remix.

Why is this useful?

1. Go back to importing from one file instead of adapter specific packages. If you ever switch adapters, just re-generate the _remix.ts_ file.
2. Adds support for overrides. Now you can override a standard Remix export with your own function. Like replacing `json`, `useLoaderData`, etc. with the `remix-typedjson` functions.
3. Add `"postinstall": "rmx gen-remix"` to _package.json_ to ensure the file is regenerated when upgrading Remix packages.

### Usage

```bash
Usage:
    $ npx rmx gen-remix [options]

  Options:
    --config PATH       Config path (default: ./gen-remix.config.json)
    --packages PACKAGES List of packages to export
    --output PATH       Output path (default: ./app/remix.ts)

  Example:
    rmx gen-remix --packages @remix-run/node @remix-run/react
```

### Config

You can also include an optional config (defaults to _gen-remix.config.json_) where you can specify overrides.

```json
{
  "exports": ["packageA", "packageB"],
  "overrides": {
    "<source-package>": [
      "<original-package>": {
        "<original-export>": "<new-source-export>",
        ...
      },
      "<original-package>": {
        "<original-export>": "<new-source-export>",
        ...
      }
    ],
    ...
  }
}
```

### Example config:

This config replaces the Remix `json`, `redirect`, `useActionData`, etc. with the versions for [`remix-typedjson`](https://github.com/kiliman/remix-typedjson).

```json
{
  "exports": ["@remix-run/node", "@remix-run/react", "remix-typedjson"],
  "overrides": {
    "remix-typedjson": {
      "@remix-run/node": {
        "json": "typedjson",
        "redirect": "redirect"
      },
      "@remix-run/react": {
        "useActionData": "useTypedActionData",
        "useFetcher": "useTypedFetcher",
        "useLoaderData": "useTypedLoaderData"
      }
    }
  }
}
```

## 😍 Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kiliman.dev/"><img src="https://avatars.githubusercontent.com/u/47168?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kiliman</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kiliman" title="Code">💻</a> <a href="https://github.com/Kiliman/rmx-cli/commits?author=kiliman" title="Documentation">📖</a></td>
    <td align="center"><a href="https://codsen.com/os/"><img src="https://avatars.githubusercontent.com/u/8344688?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roy Revelt</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=revelt" title="Documentation">📖</a></td>
    <td align="center"><a href="https://kentcdodds.com/"><img src="https://avatars.githubusercontent.com/u/1500684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kentcdodds" title="Documentation">📖</a></td>
    <td align="center"><a href="http://bgwebagency.in/"><img src="https://avatars.githubusercontent.com/u/13310363?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kiran Dash</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=kirandash" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/andrewcohen"><img src="https://avatars.githubusercontent.com/u/1016046?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Cohen</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=andrewcohen" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/courdek"><img src="https://avatars.githubusercontent.com/u/319738?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Coppola</b></sub></a><br /><a href="https://github.com/Kiliman/rmx-cli/commits?author=courdek" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
